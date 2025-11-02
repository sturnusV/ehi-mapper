import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Parse Railway's DATABASE_URL or use local development
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    // Parse Railway's DATABASE_URL format: postgresql://user:pass@host:port/db
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: { rejectUnauthorized: false } // Required for Railway
    };
  }

  // Local development fallback
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'ehi_user',
    password: process.env.DB_PASSWORD || 'ehi_password',
    database: process.env.DB_NAME || 'ehi_mapper',
    ssl: false
  };
}

const dbConfig = getDatabaseConfig();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'postgis',  // Default to service name
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'ehi_user',
    password: process.env.DB_PASSWORD || 'ehi_password',
    database: process.env.DB_NAME || 'ehi_mapper',
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  }
});

// Test database connection with retry logic
export const testConnection = async (maxRetries = 10, retryDelay = 3000) => {
  console.log(`🔗 Attempting to connect to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await db.raw('SELECT version()');
      console.log('✅ Database connected successfully');
      console.log(`📊 Database version: ${result.rows[0].version.split(',')[0]}`);
      return true;
    } catch (error: any) {
      console.log(`❌ Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt === maxRetries) {
        console.error('💥 Final database connection error:', error);
        return false;
      }

      console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return false;
};

export default db;