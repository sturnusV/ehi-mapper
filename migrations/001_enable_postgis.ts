import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Enable PostGIS extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis_raster');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP EXTENSION IF EXISTS postgis_raster');
  await knex.raw('DROP EXTENSION IF EXISTS postgis');
}