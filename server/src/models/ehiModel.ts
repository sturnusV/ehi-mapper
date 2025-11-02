import db from '../config/database';

export interface EHILocation {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  wkt: string;
  biodiversity_score: number;
  climate_resilience: number;
  human_pressure: number;
  vegetation_health: number;
  land_cover_type: string;
  protected_area: boolean;
  elevation: number;
  composite_ehi?: number;
}

export class EHIModel {
  // Get all EHI locations with coordinates and scores
  static async getEHILocations(): Promise<EHILocation[]> {
    try {
      const locations = await db('ehi_locations')
        .select(
          'id',
          'name',
          db.raw('ST_X(geom) as longitude'),
          db.raw('ST_Y(geom) as latitude'),
          db.raw('ST_AsText(geom) as wkt'),
          'biodiversity_score',
          'climate_resilience',
          'human_pressure',
          'vegetation_health',
          'land_cover_type',
          'protected_area',
          'elevation'
        );

      return locations;
    } catch (error) {
      console.error('Database error in getEHILocations:', error);
      return [];
    }
  }

  static async getTestLocations(): Promise<any[]> {
    // For backward compatibility - returns basic location data
    const locations = await this.getEHILocations();

    return locations.map(location => ({
      id: location.id,
      name: location.name,
      longitude: location.longitude,
      latitude: location.latitude,
      wkt: location.wkt
      // Add any other properties your frontend expects
    }));
  }

  // Calculate EHI score with custom weights
  static async calculateEHI(weights: {
    biodiversity: number;
    climate: number;
    humanPressure: number;
    vegetation: number;
  }): Promise<any[]> {
    try {
      const locations = await this.getEHILocations();

      const results = locations.map(location => {
        const compositeScore =
          (location.biodiversity_score * weights.biodiversity) +
          (location.climate_resilience * weights.climate) +
          ((1 - location.human_pressure) * weights.humanPressure) + // Invert human pressure
          (location.vegetation_health * weights.vegetation);

        return {
          id: location.id,
          name: location.name,
          longitude: location.longitude,
          latitude: location.latitude,
          ehi_score: Math.round(compositeScore * 1000) / 1000, // Round to 3 decimals
          breakdown: {
            biodiversity: location.biodiversity_score,
            climate: location.climate_resilience,
            human_pressure: location.human_pressure,
            vegetation: location.vegetation_health
          },
          metadata: {
            land_cover: location.land_cover_type,
            protected: location.protected_area,
            elevation: location.elevation
          }
        };
      });

      // Sort by EHI score descending
      return results.sort((a, b) => b.ehi_score - a.ehi_score);
    } catch (error) {
      console.error('Error in calculateEHI:', error);
      return [];
    }
  }

  // Get locations by land cover type
  static async getLocationsByLandCover(landCoverType: string): Promise<EHILocation[]> {
    try {
      const locations = await db('ehi_locations')
        .select(
          'id',
          'name',
          db.raw('ST_X(geom) as longitude'),
          db.raw('ST_Y(geom) as latitude'),
          'land_cover_type',
          'biodiversity_score'
        )
        .where('land_cover_type', landCoverType);

      return locations;
    } catch (error) {
      console.error('Database error in getLocationsByLandCover:', error);
      return [];
    }
  }
}