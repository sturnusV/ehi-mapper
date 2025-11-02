CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS human_footprint_data CASCADE;
DROP TABLE IF EXISTS land_cover_data CASCADE;
DROP TABLE IF EXISTS climate_data CASCADE;
DROP TABLE IF EXISTS species_occurrences CASCADE;
DROP TABLE IF EXISTS monitoring_sites CASCADE;
DROP TABLE IF EXISTS ehi_locations CASCADE;

-- Core monitoring sites table (replaces ehi_locations)
CREATE TABLE monitoring_sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(11, 8),  -- CHANGED: 11,8 for latitudes (-90 to +90)
    longitude DECIMAL(11, 8), -- CHANGED: 11,8 for longitudes (-180 to +180)
    geom GEOMETRY(Point, 4326),
    
    -- EHI Scores (will be calculated automatically)
    biodiversity_score DECIMAL(3, 2),
    climate_score DECIMAL(3, 2),
    human_pressure_score DECIMAL(3, 2),
    vegetation_score DECIMAL(3, 2),
    composite_ehi DECIMAL(3, 2),
    
    -- Metadata
    elevation INTEGER,
    protected_area BOOLEAN DEFAULT false,
    last_calculated TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- External data tables (for automated data ingestion)
CREATE TABLE species_occurrences (
    id SERIAL PRIMARY KEY,
    species_id VARCHAR(100),
    scientific_name VARCHAR(255),
    common_name VARCHAR(255),
    latitude DECIMAL(11, 8),   -- CHANGED: 11,8
    longitude DECIMAL(11, 8),  -- CHANGED: 11,8
    year INTEGER,
    data_source VARCHAR(50),
    geom GEOMETRY(Point, 4326),
    UNIQUE(species_id)
);

-- ... rest of your tables remain the same ...
CREATE TABLE climate_data (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES monitoring_sites(id),
    temperature_annual DECIMAL(5, 2),
    precipitation_annual DECIMAL(8, 2),
    temperature_trend DECIMAL(5, 4),
    drought_index DECIMAL(4, 3),
    data_source VARCHAR(50),
    year INTEGER,
    UNIQUE(site_id, year)
);

CREATE TABLE land_cover_data (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES monitoring_sites(id),
    land_cover_type VARCHAR(50),
    coverage_percentage DECIMAL(5, 2),
    data_source VARCHAR(50),
    year INTEGER,
    UNIQUE(site_id, year)
);

CREATE TABLE human_footprint_data (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES monitoring_sites(id),
    human_footprint_index DECIMAL(4, 3),
    pressure_type VARCHAR(50),
    data_source VARCHAR(50),
    year INTEGER,
    UNIQUE(site_id, year)
);

-- Create spatial indexes for performance
CREATE INDEX IF NOT EXISTS monitoring_sites_geom_idx ON monitoring_sites USING GIST(geom);
CREATE INDEX IF NOT EXISTS species_occurrences_geom_idx ON species_occurrences USING GIST(geom);

-- Insert REALISTIC Colorado River Basin monitoring sites (coordinates are fine, data type was the issue)
INSERT INTO monitoring_sites (name, latitude, longitude, geom, elevation, protected_area) VALUES 
-- Major protected areas
('Rocky Mountain NP (Headwaters)', 40.3428, -105.6836, ST_SetSRID(ST_MakePoint(-105.6836, 40.3428), 4326), 2500, true),
('Black Canyon of the Gunnison', 38.5750, -107.7250, ST_SetSRID(ST_MakePoint(-107.7250, 38.5750), 4326), 1800, true),
('Canyonlands NP (Colorado River)', 38.3269, -109.8783, ST_SetSRID(ST_MakePoint(-109.8783, 38.3269), 4326), 1400, true),
('Glen Canyon NRA', 37.0000, -111.5000, ST_SetSRID(ST_MakePoint(-111.5000, 37.0000), 4326), 1100, true),
('Grand Canyon NP', 36.0544, -112.1401, ST_SetSRID(ST_MakePoint(-112.1401, 36.0544), 4326), 2100, true),

-- Major urban/agricultural areas  
('Denver Metro (South Platte)', 39.7392, -104.9903, ST_SetSRID(ST_MakePoint(-104.9903, 39.7392), 4326), 1600, false),
('Salt Lake City (Jordan River)', 40.7608, -111.8910, ST_SetSRID(ST_MakePoint(-111.8910, 40.7608), 4326), 1300, false),
('Las Vegas Valley', 36.1699, -115.1398, ST_SetSRID(ST_MakePoint(-115.1398, 36.1699), 4326), 610, false),
('Phoenix Metro (Salt River)', 33.4484, -112.0740, ST_SetSRID(ST_MakePoint(-112.0740, 33.4484), 4326), 331, false),
('Imperial Valley Agriculture', 32.7920, -115.5630, ST_SetSRID(ST_MakePoint(-115.5630, 32.7920), 4326), -10, false),

-- Critical wetland/riparian areas
('San Juan River Wetlands', 36.8000, -108.5000, ST_SetSRID(ST_MakePoint(-108.5000, 36.8000), 4326), 1500, true),
('Colorado River Delta (Mexico)', 31.7500, -114.8333, ST_SetSRID(ST_MakePoint(-114.8333, 31.7500), 4326), 5, true),
('Yampa River Confluence', 40.5250, -108.9833, ST_SetSRID(ST_MakePoint(-108.9833, 40.5250), 4326), 1600, false),
('Green River (Dinosaur NM)', 40.5333, -109.0000, ST_SetSRID(ST_MakePoint(-109.0000, 40.5333), 4326), 1550, true);

-- Keep your original ehi_locations as a backup/demo table
CREATE TABLE ehi_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    geom GEOMETRY(Point, 4326),
    biodiversity_score FLOAT,
    climate_resilience FLOAT,
    human_pressure FLOAT,
    vegetation_health FLOAT,
    land_cover_type VARCHAR(50),
    protected_area BOOLEAN,
    elevation INTEGER
);

-- Insert your original demo data (for backward compatibility)
INSERT INTO ehi_locations (name, geom, biodiversity_score, climate_resilience, human_pressure, vegetation_health, land_cover_type, protected_area, elevation) VALUES 
('Redwood National Park', ST_SetSRID(ST_MakePoint(-124.0000, 41.3000), 4326), 0.92, 0.75, 0.15, 0.95, 'forest', true, 300),
('Great Smoky Mountains', ST_SetSRID(ST_MakePoint(-83.5000, 35.6000), 4326), 0.88, 0.70, 0.25, 0.90, 'forest', true, 500),
('Everglades National Park', ST_SetSRID(ST_MakePoint(-80.8000, 25.3000), 4326), 0.85, 0.90, 0.35, 0.80, 'wetland', true, 5),
('Okefenokee Swamp', ST_SetSRID(ST_MakePoint(-82.2000, 30.7000), 4326), 0.82, 0.85, 0.30, 0.75, 'wetland', true, 40),
('Tallgrass Prairie', ST_SetSRID(ST_MakePoint(-96.5000, 38.4000), 4326), 0.75, 0.65, 0.45, 0.70, 'grassland', true, 400),
('Badlands National Park', ST_SetSRID(ST_MakePoint(-102.0000, 43.7000), 4326), 0.68, 0.60, 0.20, 0.60, 'grassland', true, 800),
('Central Valley Agriculture', ST_SetSRID(ST_MakePoint(-120.0000, 36.5000), 4326), 0.45, 0.50, 0.85, 0.55, 'agriculture', false, 100),
('Chicago Metro Area', ST_SetSRID(ST_MakePoint(-87.6500, 41.8500), 4326), 0.35, 0.45, 0.95, 0.40, 'urban', false, 180),
('Outer Banks Coast', ST_SetSRID(ST_MakePoint(-75.5000, 35.2000), 4326), 0.78, 0.55, 0.40, 0.65, 'coastal', true, 2),
('Gulf Coast Marsh', ST_SetSRID(ST_MakePoint(-90.1000, 29.5000), 4326), 0.80, 0.70, 0.50, 0.75, 'wetland', false, 1),
('Rocky Mountain NP', ST_SetSRID(ST_MakePoint(-105.6000, 40.3000), 4326), 0.85, 0.65, 0.15, 0.85, 'alpine', true, 2500),
('Appalachian Forest', ST_SetSRID(ST_MakePoint(-78.5000, 39.0000), 4326), 0.79, 0.68, 0.30, 0.82, 'forest', false, 600);

CREATE INDEX ehi_locations_geom_idx ON ehi_locations USING GIST (geom);