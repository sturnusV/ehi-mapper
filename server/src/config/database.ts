import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL or use local development config
function getDatabaseConfig() {
  // Railway automatically provides DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('🔗 Using Railway DATABASE_URL');
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Local development fallback
  console.log('🔗 Using local development database config');
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

console.log(`📊 Database Config: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

const db = knex({
  client: 'pg',
  connection: dbConfig,
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

// Test database connection
export const testConnection = async (maxRetries = 10, retryDelay = 3000) => {
  console.log(`🔗 Attempting to connect to database at ${dbConfig.host}:${dbConfig.port}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await db.raw('SELECT version()');
      console.log('✅ Database connected successfully');
      console.log(`📊 Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
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