import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import db, { testConnection } from './config/database';
import { EHIModel } from './models/ehiModel';
import { AutomationScheduler } from './services/scheduler';
import { DataIngestionService } from './services/dataIngestion';
import { EHICalculator } from './services/ehiCalculator';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://ehi-mapper.vercel.app',
    'http://localhost:5173', // Local development
    'http://localhost:3000'  // Alternative local port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection check on startup
testConnection();

// Initialize automation when server starts (AFTER db connection)
// Use setTimeout to ensure DB is ready
setTimeout(() => {
  AutomationScheduler.initialize();
}, 5000);

// Manual data control endpoints
app.post('/api/data/refresh', async (req, res) => {
  try {
    await AutomationScheduler.runFullDataPipeline();
    res.json({
      success: true,
      message: 'Data refresh completed successfully'
    });
  } catch (error) {
    console.error('Data refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Data refresh failed'
    });
  }
});

app.post('/api/data/refresh/:source', async (req, res) => {
  const { source } = req.params;

  try {
    let result;
    switch (source) {
      case 'gbif':
        result = await DataIngestionService.fetchGBIFData();
        break;
      case 'climate':
        result = await DataIngestionService.fetchWorldClimData();
        break;
      case 'landcover':
        result = await DataIngestionService.fetchLandCoverData();
        break;
      case 'footprint':
        result = await DataIngestionService.fetchHumanFootprintData();
        break;
      default:
        return res.status(400).json({ error: 'Unknown data source' });
    }

    // Recalculate EHI after data update (using simple calculator)
    await EHICalculator.calculateAllSites();

    res.json({
      success: true,
      message: `${source} data refreshed`,
      records_processed: result
    });
  } catch (error) {
    console.error(`Data refresh error for ${source}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to refresh ${source} data`
    });
  }
});

app.get('/api/data/status', async (req, res) => {
  try {
    const status = await db.raw(`
      SELECT 
        'monitoring_sites' as table_name,
        COUNT(*) as record_count,
        AVG(composite_ehi) as avg_ehi_score
      FROM monitoring_sites
      UNION ALL
      SELECT 
        'species_occurrences' as table_name,
        COUNT(*) as record_count,
        NULL as avg_ehi_score
      FROM species_occurrences
      UNION ALL
      SELECT 
        'climate_data' as table_name,
        COUNT(*) as record_count,
        NULL as avg_ehi_score
      FROM climate_data
      UNION ALL
      SELECT 
        'land_cover_data' as table_name,
        COUNT(*) as record_count,
        NULL as avg_ehi_score
      FROM land_cover_data
      UNION ALL
      SELECT 
        'human_footprint_data' as table_name,
        COUNT(*) as record_count,
        NULL as avg_ehi_score
      FROM human_footprint_data
    `);

    res.json({ success: true, data: status.rows });
  } catch (error) {
    console.error('Data status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get data status' });
  }
});

// Health check endpoint (now includes DB status)
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();

  res.json({
    status: 'OK',
    message: 'EHI Mapper Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus ? 'connected' : 'disconnected'
  });
});

// Get test locations from actual database (for backward compatibility)
app.get('/api/test-locations', async (req, res) => {
  try {
    const locations = await EHIModel.getTestLocations();

    res.json({
      success: true,
      data: locations,
      count: locations.length,
      source: 'postgis_database'
    });
  } catch (error) {
    console.error('Error fetching test locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations from database'
    });
  }
});

// Get spatial data in GeoJSON format (for maps) - for backward compatibility
app.get('/api/spatial-data', async (req, res) => {
  try {
    const locations = await EHIModel.getTestLocations();

    // Convert to GeoJSON format
    const geoJson = {
      type: 'FeatureCollection',
      features: locations.map(location => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          id: location.id,
          name: location.name,
          wkt: location.wkt
        }
      }))
    };

    res.json({
      success: true,
      data: geoJson,
      format: 'geojson'
    });
  } catch (error) {
    console.error('Error generating spatial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate spatial data'
    });
  }
});

// Calculate EHI scores with custom weights
app.post('/api/calculate-ehi', async (req, res) => {
  try {
    const { weights } = req.body;

    // Default weights if none provided
    const defaultWeights = {
      biodiversity: 0.3,
      climate: 0.25,
      humanPressure: 0.25,
      vegetation: 0.2
    };

    const ehiResults = await EHIModel.calculateEHI(weights || defaultWeights);

    res.json({
      success: true,
      data: ehiResults,
      weights: weights || defaultWeights,
      count: ehiResults.length
    });
  } catch (error) {
    console.error('Error calculating EHI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate EHI scores'
    });
  }
});

// Get enhanced EHI locations
app.get('/api/ehi-locations', async (req, res) => {
  try {
    const locations = await EHIModel.getEHILocations();

    res.json({
      success: true,
      data: locations,
      count: locations.length,
      source: 'postgis_database'
    });
  } catch (error) {
    console.error('Error fetching EHI locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch EHI locations'
    });
  }
});

// Get spatial data with enhanced properties
app.get('/api/enhanced-spatial-data', async (req, res) => {
  try {
    const locations = await EHIModel.getEHILocations();

    // Convert to enhanced GeoJSON
    const geoJson = {
      type: 'FeatureCollection',
      features: locations.map(location => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          id: location.id,
          name: location.name,
          biodiversity_score: location.biodiversity_score,
          climate_resilience: location.climate_resilience,
          human_pressure: location.human_pressure,
          vegetation_health: location.vegetation_health,
          land_cover_type: location.land_cover_type,
          protected_area: location.protected_area,
          elevation: location.elevation,
          // Color coding based on land cover
          color: getColorForLandCover(location.land_cover_type),
          // Size based on biodiversity
          size: Math.max(5, location.biodiversity_score * 15)
        }
      }))
    };

    res.json({
      success: true,
      data: geoJson,
      format: 'geojson'
    });
  } catch (error) {
    console.error('Error generating enhanced spatial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhanced spatial data'
    });
  }
});

// NEW: Get monitoring sites data (for the automated system)
app.get('/api/monitoring-sites', async (req, res) => {
  try {
    const sites = await db('monitoring_sites')
      .select('*')
      .orderBy('composite_ehi', 'desc');

    res.json({
      success: true,
      data: sites,
      count: sites.length,
      source: 'automated_monitoring_sites'
    });
  } catch (error) {
    console.error('Error fetching monitoring sites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch monitoring sites'
    });
  }
});

// NEW: Get enhanced spatial data for monitoring sites
app.get('/api/monitoring-spatial-data', async (req, res) => {
  try {
    const sites = await db('monitoring_sites')
      .select('*')
      .whereNotNull('composite_ehi');

    // Convert to enhanced GeoJSON
    const geoJson = {
      type: 'FeatureCollection',
      features: sites.map(site => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [site.longitude, site.latitude]
        },
        properties: {
          id: site.id,
          name: site.name,
          biodiversity_score: site.biodiversity_score,
          climate_score: site.climate_score,
          human_pressure_score: site.human_pressure_score,
          vegetation_score: site.vegetation_score,
          composite_ehi: site.composite_ehi,
          elevation: site.elevation,
          protected_area: site.protected_area,
          // Color coding based on EHI score
          color: getColorForEHI(site.composite_ehi),
          // Size based on EHI score
          size: Math.max(8, (site.composite_ehi || 0.5) * 20)
        }
      }))
    };

    res.json({
      success: true,
      data: geoJson,
      format: 'geojson'
    });
  } catch (error) {
    console.error('Error generating monitoring spatial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate monitoring spatial data'
    });
  }
});

// Helper function for land cover colors
function getColorForLandCover(landCoverType: string): string {
  const colors: { [key: string]: string } = {
    'forest': '#228B22',
    'wetland': '#20B2AA',
    'grassland': '#9ACD32',
    'agriculture': '#FFD700',
    'urban': '#8B0000',
    'coastal': '#1E90FF',
    'alpine': '#708090',
    'coniferous_forest': '#228B22',
    'shrubland': '#CDDC39',
    'desert_scrub': '#FFA726',
    'riparian': '#4DB6AC'
  };
  return colors[landCoverType] || '#666666';
}

// Helper function for EHI score colors
function getColorForEHI(ehiScore: number): string {
  if (ehiScore >= 0.8) return '#1A9850'; // Dark green - excellent
  if (ehiScore >= 0.6) return '#91CF60'; // Green - good
  if (ehiScore >= 0.4) return '#FEE08B'; // Yellow - moderate
  if (ehiScore >= 0.2) return '#FC8D59'; // Orange - poor
  return '#D73027'; // Red - very poor
}

// Get land cover statistics
app.get('/api/land-cover-stats', async (req, res) => {
  try {
    const stats = await db('ehi_locations')
      .select('land_cover_type')
      .count('* as count')
      .avg('biodiversity_score as avg_biodiversity')
      .avg('climate_resilience as avg_climate_resilience')
      .groupBy('land_cover_type');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching land cover stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch land cover statistics'
    });
  }
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

// 404 handler
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
  console.log(`🧮 EHI Calculator: http://localhost:${PORT}/api/calculate-ehi`);
  console.log(`🌍 Spatial data: http://localhost:${PORT}/api/spatial-data`);
  console.log(`🔄 Data automation: http://localhost:${PORT}/api/data/refresh`);
  console.log(`📈 Monitoring sites: http://localhost:${PORT}/api/monitoring-sites`);
});