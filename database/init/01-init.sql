CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;

-- We'll add real tables later, this is just to test
CREATE TABLE IF NOT EXISTS test_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    geom GEOMETRY(Point, 4326)
);

INSERT INTO test_locations (name, geom) VALUES 
('Test Point 1', ST_SetSRID(ST_MakePoint(-122.4, 37.8), 4326)),
('Test Point 2', ST_SetSRID(ST_MakePoint(-100.0, 40.0), 4326));