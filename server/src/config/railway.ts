import dotenv from 'dotenv';
dotenv.config();

// Railway provides DATABASE_URL, we need to parse it
export function getRailwayConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse DATABASE_URL format: postgresql://user:pass@host:port/db
    const url = new URL(databaseUrl);
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