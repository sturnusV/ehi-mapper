exports.up = function(knex) {
  return knex.raw(`
    -- Enable PostGIS extension
    CREATE EXTENSION IF NOT EXISTS postgis;
    
    -- Create monitoring_sites table
    CREATE TABLE IF NOT EXISTS monitoring_sites (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      latitude DECIMAL(11, 8),
      longitude DECIMAL(11, 8),
      geom GEOMETRY(Point, 4326),
      biodiversity_score DECIMAL(3, 2),
      climate_score DECIMAL(3, 2),
      human_pressure_score DECIMAL(3, 2),
      vegetation_score DECIMAL(3, 2),
      composite_ehi DECIMAL(3, 2),
      elevation INTEGER,
      protected_area BOOLEAN DEFAULT false,
      last_calculated TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create other tables...
    CREATE TABLE IF NOT EXISTS species_occurrences (
      id SERIAL PRIMARY KEY,
      species_id VARCHAR(100),
      scientific_name VARCHAR(255),
      common_name VARCHAR(255),
      latitude DECIMAL(11, 8),
      longitude DECIMAL(11, 8),
      year INTEGER,
      data_source VARCHAR(50),
      geom GEOMETRY(Point, 4326),
      UNIQUE(species_id)
    );

    -- Create spatial indexes
    CREATE INDEX IF NOT EXISTS monitoring_sites_geom_idx ON monitoring_sites USING GIST(geom);
    CREATE INDEX IF NOT EXISTS species_occurrences_geom_idx ON species_occurrences USING GIST(geom);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS species_occurrences;
    DROP TABLE IF EXISTS monitoring_sites;
  `);
};