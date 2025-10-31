import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors());   // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EHI Mapper Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test spatial data endpoint (we'll replace this with real DB later)
app.get('/api/test-locations', (req, res) => {
  const testLocations = [
    { 
      id: 1, 
      name: 'San Francisco', 
      lng: -122.4, 
      lat: 37.8,
      ehi_score: 0.75 
    },
    { 
      id: 2, 
      name: 'Kansas', 
      lng: -100.0, 
      lat: 40.0,
      ehi_score: 0.82 
    }
  ];
  
  res.json({
    success: true,
    data: testLocations,
    count: testLocations.length
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - FIXED: Use a proper catch-all route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EHI Mapper Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗺️  Test data: http://localhost:${PORT}/api/test-locations`);
});