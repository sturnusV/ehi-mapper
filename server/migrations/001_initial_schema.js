exports.up = async function(knex) {
  // Enable PostGIS extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');
  
  // Create monitoring_sites table
  await knex.schema.createTable('monitoring_sites', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.decimal('latitude', 11, 8);
    table.decimal('longitude', 11, 8);
    table.specificType('geom', 'geometry(Point, 4326)');
    table.decimal('biodiversity_score', 3, 2);
    table.decimal('climate_score', 3, 2);
    table.decimal('human_pressure_score', 3, 2);
    table.decimal('vegetation_score', 3, 2);
    table.decimal('composite_ehi', 3, 2);
    table.integer('elevation');
    table.boolean('protected_area').defaultTo(false);
    table.timestamp('last_calculated');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Create species_occurrences table
  await knex.schema.createTable('species_occurrences', (table) => {
    table.increments('id').primary();
    table.string('species_id', 100);
    table.string('scientific_name', 255);
    table.string('common_name', 255);
    table.decimal('latitude', 11, 8);
    table.decimal('longitude', 11, 8);
    table.integer('year');
    table.string('data_source', 50);
    table.specificType('geom', 'geometry(Point, 4326)');
  });

  // Create other tables...
  await knex.schema.createTable('climate_data', (table) => {
    table.increments('id').primary();
    table.integer('site_id').references('id').inTable('monitoring_sites');
    table.decimal('temperature_annual', 5, 2);
    table.decimal('precipitation_annual', 8, 2);
    table.decimal('temperature_trend', 5, 4);
    table.decimal('drought_index', 4, 3);
    table.string('data_source', 50);
    table.integer('year');
  });

  await knex.schema.createTable('land_cover_data', (table) => {
    table.increments('id').primary();
    table.integer('site_id').references('id').inTable('monitoring_sites');
    table.string('land_cover_type', 50);
    table.decimal('coverage_percentage', 5, 2);
    table.string('data_source', 50);
    table.integer('year');
  });

  await knex.schema.createTable('human_footprint_data', (table) => {
    table.increments('id').primary();
    table.integer('site_id').references('id').inTable('monitoring_sites');
    table.decimal('human_footprint_index', 4, 3);
    table.string('pressure_type', 50);
    table.string('data_source', 50);
    table.integer('year');
  });

  // Create indexes
  await knex.raw('CREATE INDEX monitoring_sites_geom_idx ON monitoring_sites USING GIST(geom)');
  await knex.raw('CREATE INDEX species_occurrences_geom_idx ON species_occurrences USING GIST(geom)');
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('human_footprint_data');
  await knex.schema.dropTableIfExists('land_cover_data');
  await knex.schema.dropTableIfExists('climate_data');
  await knex.schema.dropTableIfExists('species_occurrences');
  await knex.schema.dropTableIfExists('monitoring_sites');
};