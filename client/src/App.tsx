import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import logo from './assets/react.svg';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningIcon from '@mui/icons-material/Warning';

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Slider,
  Button,
  Stack
} from '@mui/material';

// --- Theme Definition ---
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' }, // Eco green
    secondary: { main: '#ff6f00' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  }
});

// --- Types/Interfaces ---
interface EHIWeights {
  biodiversity: number;
  climate: number;
  humanPressure: number;
  vegetation: number;
}

interface EHIResult {
  id: number;
  longitude: number;
  latitude: number;
  ehi_score: number;
  breakdown: {
    biodiversity: number;
    climate_resilience: number;
    human_pressure: number;
    vegetation_health: number;
  };
}

interface EnhancedMapViewProps {
  spatialData: any;
  ehiResults: EHIResult[];
}

interface EHIControlsProps {
  weights: EHIWeights;
  onWeightsChange: React.Dispatch<React.SetStateAction<EHIWeights>>;
  onCalculateEHI: () => Promise<void>;
  onResetEHI: () => void;
  calculating: boolean;
}

type LayerKey = 'biodiversity' | 'climate' | 'human_pressure' | 'vegetation';

// --- Component: EHIControls ---
const EHIControls: React.FC<EHIControlsProps> = ({
  weights,
  onWeightsChange,
  onCalculateEHI,
  onResetEHI,
  calculating
}) => {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  // Allow small floating point errors for validation
  const isValidWeights = Math.abs(totalWeight - 1) < 0.01;

  const handleWeightChange = (key: keyof EHIWeights) => (_event: Event, newValue: number | number[]) => {
    onWeightsChange(prev => ({
      ...prev,
      [key]: newValue as number
    }));
  };

  const weightConfigs = [
    { key: 'biodiversity' as keyof EHIWeights, label: '🌿 Biodiversity', color: '#4caf50' },
    { key: 'climate' as keyof EHIWeights, label: '🌤️ Climate', color: '#2196f3' },
    { key: 'humanPressure' as keyof EHIWeights, label: '🏙️ Human Pressure', color: '#ff9800' },
    { key: 'vegetation' as keyof EHIWeights, label: '🌳 Vegetation', color: '#8bc34a' }
  ];

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          EHI Weight Calculator
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          Adjust the weights for each factor to calculate the Ecosystem Health Index. Total must equal 1.0!
        </Typography>

        {!isValidWeights && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Weights must sum to 1.0 (Current: {totalWeight.toFixed(2)})
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {weightConfigs.map((config) => (
            <Box key={config.key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {config.label}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={config.color}>
                  {weights[config.key].toFixed(2)}
                </Typography>
              </Box>
              <Slider
                value={weights[config.key]}
                onChange={handleWeightChange(config.key)}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value.toFixed(2)}
                sx={{ color: config.color }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="subtitle1" color="primary">
            Total Weight: <strong style={{ color: isValidWeights ? theme.palette.primary.main : theme.palette.secondary.main }}>{totalWeight.toFixed(2)}</strong>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>

            {/* 1. Run EHI Model Button (Play) */}
            <Button
              variant="contained"
              color="secondary"
              onClick={onCalculateEHI}
              disabled={!isValidWeights || calculating}
              startIcon={calculating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              sx={{
                // 1. Make it square
                width: 40,
                height: 40,
                minWidth: 0, // Override MUI default min-width
                padding: 0, // Override default padding (from your CSS and MUI)

                // 2. Make it circular
                borderRadius: '50%',

                // 3. Center the content
                justifyContent: 'center',
                alignItems: 'center',

                // 4. Increase icon size if needed (optional, MUI scales well usually)
                '& .MuiButton-startIcon': {
                  margin: 0, // Remove default startIcon margin
                  '& > *': {
                    fontSize: 24, // Optional: increase icon size (default is usually 24px)
                  },
                },
              }}
            />

            {/* 2. Start Over Button (Refresh) */}
            <Button
              variant="outlined"
              color="primary"
              onClick={onResetEHI}
              disabled={calculating}
              startIcon={<RefreshIcon />}
              sx={{
                // 1. Make it square
                width: 40,
                height: 40,
                minWidth: 0, // Override MUI default min-width
                padding: 0, // Override default padding

                // 2. Make it circular
                borderRadius: '50%',

                // 3. Center the content
                justifyContent: 'center',
                alignItems: 'center',

                // 4. Increase icon size if needed
                '& .MuiButton-startIcon': {
                  margin: 0, // Remove default startIcon margin
                  '& > *': {
                    fontSize: 24, // Optional: increase icon size
                  },
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// --- Component: EnhancedMapView ---
const EnhancedMapView: React.FC<EnhancedMapViewProps> = ({ spatialData, ehiResults }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>('biodiversity');

  // Utility function to get the GeoJSON property key from the selected layer name
  const getScoreKey = useCallback((layer: LayerKey) => {
    switch (layer) {
      case 'biodiversity': return 'biodiversity_score';
      case 'climate': return 'climate_resilience';
      case 'human_pressure': return 'human_pressure';
      case 'vegetation': return 'vegetation_health';
      default: return 'biodiversity_score';
    }
  }, []);

  // Function to dynamically update the map visualization based on the selected layer
  const updateMapVisualization = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    const scoreKey = getScoreKey(selectedLayer);
    const isEhiCalculated = ehiResults.length > 0;

    if (isEhiCalculated) {
      // When EHI is calculated, show EHI scores (this overrides layer selection)
      const ehiColorExpression = [
        'interpolate',
        ['linear'],
        ['get', 'ehi_score'],
        0, '#D73027', // Red (Poor)
        0.5, '#FFFFBF', // Yellow (Moderate)
        1, '#1A9850' // Dark Green (Excellent)
      ];

      const ehiSizeExpression = [
        'interpolate',
        ['linear'],
        ['get', 'ehi_score'],
        0, 10,
        1, 20
      ];

      if (map.current!.getLayer('enhanced-ehi-points')) {
        map.current!.setPaintProperty('enhanced-ehi-points', 'circle-color', ehiColorExpression);
        map.current!.setPaintProperty('enhanced-ehi-points', 'circle-radius', ehiSizeExpression);
      }

      if (map.current!.getLayer('enhanced-ehi-labels')) {
        map.current!.setLayoutProperty(
          'enhanced-ehi-labels',
          'text-field',
          ['concat', 'EHI: ', ['round', ['get', 'ehi_score'], 3]]
        );
      }

    } else {
      // When EHI is NOT calculated, show individual layer scores
      const layerColorExpression = [
        'interpolate',
        ['linear'],
        ['get', scoreKey],
        0, '#D73027', // Red (Low score)
        0.5, '#FFFFBF', // Yellow (Medium score)
        1, '#1A9850' // Green (High score)
      ];

      const layerSizeExpression = [
        'interpolate',
        ['linear'],
        ['get', scoreKey],
        0, 8,
        0.3, 11,
        0.6, 14,
        1, 18
      ];

      if (map.current!.getLayer('enhanced-ehi-points')) {
        map.current!.setPaintProperty('enhanced-ehi-points', 'circle-color', layerColorExpression);
        map.current!.setPaintProperty('enhanced-ehi-points', 'circle-radius', layerSizeExpression);
      }

      if (map.current!.getLayer('enhanced-ehi-labels')) {
        map.current!.setLayoutProperty(
          'enhanced-ehi-labels',
          'text-field',
          ['concat', ['upcase', ['slice', selectedLayer, 0, 3]], ': ', ['round', ['get', scoreKey], 2]]
        );
      }
    }

  }, [mapLoaded, getScoreKey, ehiResults, selectedLayer]);

  // Initial Map Setup Effect
  useEffect(() => {
    if (!mapContainer.current || !spatialData) return;

    // Destroy map if it already exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'simple-tiles',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 22
        }]
      },
      center: [-98.5795, 39.8283],
      zoom: 3
    });

    map.current.addControl(new maplibregl.NavigationControl({}), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl());

    map.current.on('load', () => {
      setMapLoaded(true);

      // Add enhanced GeoJSON source
      map.current!.addSource('enhanced-ehi-data', {
        type: 'geojson',
        data: spatialData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add clustering layers
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'enhanced-ehi-data',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#4CAF50',
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        }
      });

      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'enhanced-ehi-data',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Inter Regular'],
          'text-size': 12
        }
      });

      // Add individual points layer
      map.current!.addLayer({
        id: 'enhanced-ehi-points',
        type: 'circle',
        source: 'enhanced-ehi-data',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 10,
          'circle-color': '#cccccc',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Add labels for individual points
      map.current!.addLayer({
        id: 'enhanced-ehi-labels',
        type: 'symbol',
        source: 'enhanced-ehi-data',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Inter Regular', 'Arial Unicode MS Regular'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-size': 11
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      // Call initial visualization update
      updateMapVisualization();

      // Enhanced popup with ecological data
      map.current!.on('click', 'enhanced-ehi-points', (e) => {
        if (!e.features?.[0]) return;

        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const currentScoreKey = getScoreKey(selectedLayer);
        const currentScore = properties[currentScoreKey];
        const currentScoreDisplay = ehiResults.length > 0
          ? `<div style="margin-top: 8px; font-weight: bold; color: #2e7d32;">EHI Score: ${properties.ehi_score?.toFixed(3) || 'N/A'}</div>`
          : `<div style="margin-top: 8px; font-weight: bold; color: #2196f3;">${selectedLayer.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ${(currentScore * 100).toFixed(0)}%</div>`;

        new maplibregl.Popup({ closeButton: false, anchor: 'bottom' })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 4px; min-width: 250px; font-family: Inter, sans-serif;">
              <h3 style="margin: 0 0 4px 0; color: #2e7d32; font-size: 16px;">${properties.name}</h3>
              <div style="background: ${properties.land_cover_type === 'forest' ? '#228B22' :
              properties.land_cover_type === 'wetland' ? '#20B2AA' :
                properties.land_cover_type === 'grassland' ? '#9ACD32' :
                  properties.land_cover_type === 'agriculture' ? '#FFD700' :
                    properties.land_cover_type === 'urban' ? '#8B0000' :
                      properties.land_cover_type === 'coastal' ? '#1E90FF' : '#708090'}; 
                height: 3px; margin-bottom: 8px; border-radius: 2px;"></div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                <div><strong>Land Cover:</strong></div> <div>${properties.land_cover_type.charAt(0).toUpperCase() + properties.land_cover_type.slice(1)}</div>
                <div><strong>Biodiversity:</strong></div> <div>${(properties.biodiversity_score * 100).toFixed(0)}%</div>
                <div><strong>Climate Resilience:</strong></div> <div>${(properties.climate_resilience * 100).toFixed(0)}%</div>
                <div><strong>Human Pressure:</strong></div> <div>${(properties.human_pressure * 100).toFixed(0)}%</div>
                <div><strong>Vegetation Health:</strong></div> <div>${(properties.vegetation_health * 100).toFixed(0)}%</div>
              </div>
              ${currentScoreDisplay}
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'enhanced-ehi-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'enhanced-ehi-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [spatialData]);

  // Effect to update visualization when EHI results or selected layer changes
  useEffect(() => {
    if (mapLoaded) {
      updateMapVisualization();
    }
  }, [selectedLayer, ehiResults, mapLoaded, updateMapVisualization]);

  const handleLayerChange = (event: SelectChangeEvent) => {
    setSelectedLayer(event.target.value as LayerKey);
  };

  const getLegendText = () => {
    if (ehiResults.length > 0) {
      return "Current View: EHI Score (Size & Color: Red=Low, Green=High)";
    }

    const layerDisplay = selectedLayer.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `Current View: ${layerDisplay} (Size & Color: Red=Low, Green=High)`;
  };

  const getColorLegend = () => {
    if (ehiResults.length > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#D73027', mr: 0.5 }} />
            <Typography variant="caption">Low EHI</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#FFFFBF', mr: 0.5 }} />
            <Typography variant="caption">Medium</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#1A9850', mr: 0.5 }} />
            <Typography variant="caption">High EHI</Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#D73027', mr: 0.5 }} />
          <Typography variant="caption">Low {selectedLayer.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#FFFFBF', mr: 0.5 }} />
          <Typography variant="caption">Medium</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#1A9850', mr: 0.5 }} />
          <Typography variant="caption">High</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%', minHeight: { xs: '550px', md: '700px' }, borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" component="h2" color="primary">
            🗺️ Ecosystem Visualization Map
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }} disabled={ehiResults.length > 0}>
              <InputLabel>Layer View</InputLabel>
              <Select
                value={selectedLayer}
                label="Layer View"
                onChange={handleLayerChange}
              >
                <MenuItem value="biodiversity">Biodiversity Score</MenuItem>
                <MenuItem value="climate">Climate Resilience</MenuItem>
                <MenuItem value="human_pressure">Human Pressure</MenuItem>
                <MenuItem value="vegetation">Vegetation Health</MenuItem>
              </Select>
            </FormControl>

            <Chip
              label={mapLoaded ? `Features: ${spatialData?.features?.length || 0}` : "Loading Map..."}
              color={mapLoaded ? "secondary" : "default"}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        <Box
          ref={mapContainer}
          sx={{
            flex: 1,
            minHeight: '400px',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'primary.light',
            width: '100%',
            position: 'relative',
            '& .maplibregl-canvas': {
              height: '100% !important',
              width: '100% !important'
            },
            '& .maplibregl-control-container': { zIndex: 10 }
          }}
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
            {getLegendText()}
          </Typography>
          {getColorLegend()}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            <strong>Ecosystem Type:</strong>
            <span style={{ color: '#228B22', fontWeight: 'bold' }}> Forest</span> •
            <span style={{ color: '#20B2AA', fontWeight: 'bold' }}> Wetland</span> •
            <span style={{ color: '#9ACD32', fontWeight: 'bold' }}> Grassland</span> •
            <span style={{ color: '#FFD700', fontWeight: 'bold' }}> Agriculture</span> •
            <span style={{ color: '#8B0000', fontWeight: 'bold' }}> Urban</span> •
            <span style={{ color: '#1E90FF', fontWeight: 'bold' }}> Coastal</span> •
            <span style={{ color: '#708090', fontWeight: 'bold' }}> Alpine</span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};


// --- Main App Component ---
function App() {
  // Default weights to reset to
  const DEFAULT_WEIGHTS: EHIWeights = {
    biodiversity: 0.30,
    climate: 0.25,
    humanPressure: 0.25,
    vegetation: 0.20
  };

  const [testLocations, setTestLocations] = useState<any[]>([]);
  const [initialSpatialData, setInitialSpatialData] = useState<any>(null); // Store initial GeoJSON
  const [enhancedSpatialData, setEnhancedSpatialData] = useState<any>(null); // Current GeoJSON (can be updated)
  const [ehiResults, setEhiResults] = useState<EHIResult[]>([]);
  const [weights, setWeights] = useState<EHIWeights>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log('🔄 Fetching data from backend...');

        const [locationsResponse, enhancedSpatialResponse] = await Promise.all([
          fetch('http://localhost:3001/api/ehi-locations'),
          fetch('http://localhost:3001/api/enhanced-spatial-data')
        ]);

        const locationsResult = await locationsResponse.json();
        const enhancedSpatialResult = await enhancedSpatialResponse.json();

        console.log('📍 Locations result:', locationsResult);
        console.log('🗺️ Enhanced spatial result:', enhancedSpatialResult);

        if (locationsResult.success) {
          setTestLocations(locationsResult.data);
          console.log(`✅ Loaded ${locationsResult.data.length} locations`);
        }

        if (enhancedSpatialResult.success) {
          setInitialSpatialData(enhancedSpatialResult.data); // Store original
          setEnhancedSpatialData(enhancedSpatialResult.data); // Set current data
          console.log(`✅ Loaded ${enhancedSpatialResult.data.features?.length || 0} spatial features`);
        }

      } catch (err) {
        console.error('❌ API Error:', err);
        setError('Failed to connect to backend API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCalculateEHI = async () => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      setError("Please ensure the weights sum exactly to 1.0 before calculating.");
      return;
    }

    try {
      setCalculating(true);
      setError(null);
      // Do NOT clear ehiResults here, let the new results overwrite it or error out

      const response = await fetch('http://localhost:3001/api/calculate-ehi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // 1. Update EHI results list
        setEhiResults(result.data);

        // 2. Update GeoJSON data for the map with EHI score and breakdown
        const newFeatures = enhancedSpatialData.features.map((feature: any) => {
          const ehi = result.data.find((e: EHIResult) => e.id === feature.properties.id);
          return ehi ? {
            ...feature,
            properties: {
              ...feature.properties,
              ehi_score: ehi.ehi_score,
              ...ehi.breakdown // Adds breakdown metrics to properties
            }
          } : feature;
        });

        setEnhancedSpatialData({ ...enhancedSpatialData, features: newFeatures });

        setSnackbar({ open: true, message: `EHI calculated for ${result.data.length} locations! Map updated.` });
      } else {
        setError(result.message || 'EHI calculation failed on the server. Status: ' + response.status);
      }
    } catch (err) {
      console.error('EHI Calculation Error:', err);
      setError('Failed to calculate EHI scores. Check network connection or backend service.');
    } finally {
      setCalculating(false);
    }
  };

  const handleResetEHI = () => {
    setEhiResults([]);
    setWeights(DEFAULT_WEIGHTS);
    // Use the initial data to reset the map properties
    if (initialSpatialData) {
      setEnhancedSpatialData(initialSpatialData);
    }
    setSnackbar({ open: true, message: 'EHI model results cleared. Ready for a new run!' });
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh', flexDirection: 'column' }}>
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Connecting to Backend and Loading Data...</Typography>
        </Grid>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" sx={{ boxShadow: 5 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src={logo}
              alt="EHI Mapper Logo"
              style={{ height: '100px', marginRight: 8 }}
            />
          </Box>

          {!enhancedSpatialData && (
            <Chip

              variant="outlined"
              color="warning"

              size="small"

              sx={{
                backgroundColor: 'transparent',
                borderColor: 'warning.light',
                height: 'auto',
                padding: '4px 8px',

                '& .MuiChip-label': {
                  padding: 0,
                },
              }}

              label={
                <Stack
                  direction="column"
                  alignItems="center"
                  spacing={0.2}
                >
                  <WarningIcon sx={{ fontSize: 18 }} />
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      lineHeight: 1,
                      color: 'warning.main'
                    }}
                  >
                    No Data
                  </Typography>
                </Stack>
              }
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid>
            <Grid container direction="column" spacing={3}>
              <Grid>
                <EHIControls
                  weights={weights}
                  onWeightsChange={setWeights}
                  onCalculateEHI={handleCalculateEHI}
                  onResetEHI={handleResetEHI}
                  calculating={calculating}
                />
              </Grid>

              {/* EHI Results List */}
              {ehiResults.length > 0 && (
                <Grid>
                  <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="secondary" sx={{ borderBottom: '2px solid', borderBottomColor: 'secondary.light', pb: 1 }}>
                        EHI Score Summary ({ehiResults.length} Locations)
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {ehiResults
                          .sort((a, b) => b.ehi_score - a.ehi_score)
                          .map(result => (
                            <Box key={result.id} sx={{ mb: 1, p: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dotted #eee' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Site {result.id} - {testLocations.find(l => l.id === result.id)?.name || `ID ${result.id}`}
                              </Typography>
                              <Chip
                                label={result.ehi_score.toFixed(3)}
                                size="small"
                                sx={{
                                  ml: 1,
                                  fontWeight: 'bold',
                                  // Color grading for scores
                                  backgroundColor: result.ehi_score > 0.75 ? '#1A9850' : result.ehi_score > 0.5 ? '#91CF60' : result.ehi_score > 0.25 ? '#FEE08B' : '#D73027',
                                  color: 'white'
                                }}
                              />
                            </Box>
                          ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid>
            {enhancedSpatialData ? (
              <EnhancedMapView
                spatialData={enhancedSpatialData}
                ehiResults={ehiResults}
              />
            ) : (
              <Alert severity="warning" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>GeoJSON data is missing. Cannot initialize map.</Alert>
            )}
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}

export default App;