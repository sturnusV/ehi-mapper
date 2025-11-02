import db from '../config/database';

export interface EHIScores {
    biodiversity_score: number;
    climate_score: number;
    human_pressure_score: number;
    vegetation_score: number;
    composite_ehi: number;
}

export class EHICalculator {
    // Main method to calculate EHI for all sites
    static async calculateAllSites(): Promise<number> {
        try {
            console.log('🧮 Calculating EHI scores for all sites...');

            // Get all monitoring sites with their aggregated data
            const sitesWithData = await this.getSitesWithAggregatedData();

            // Calculate scores for each site
            const ehiResults = sitesWithData.map(site => this.calculateSiteEHIScores(site));

            // Update database with new scores
            await this.updateSiteScores(ehiResults);

            console.log(`✅ EHI: Calculated scores for ${ehiResults.length} sites`);
            return ehiResults.length;
        } catch (error) {
            console.error('❌ EHI calculation failed:', error);
            throw error;
        }
    }

    // Aggregate all data for each monitoring site
    private static async getSitesWithAggregatedData() {
        const sites = await db('monitoring_sites as ms')
            .leftJoin('species_occurrences as so', db.raw('ST_DWithin(so.geom, ms.geom, 10000)')) // 10km buffer
            .leftJoin('climate_data as cd', 'cd.site_id', 'ms.id')
            .leftJoin('land_cover_data as lcd', 'lcd.site_id', 'ms.id')
            .leftJoin('human_footprint_data as hfd', 'hfd.site_id', 'ms.id')
            .select(
                'ms.id',
                'ms.name',
                'ms.latitude',
                'ms.longitude',
                db.raw('COUNT(DISTINCT so.species_id) as species_count'),
                // 👇 REPLACED: climate_anomaly, temperature, precipitation
                db.raw('AVG(cd.temperature_annual) as avg_temperature_annual'),
                db.raw('AVG(cd.precipitation_annual) as avg_precipitation_annual'),
                db.raw('AVG(cd.temperature_trend) as avg_temperature_trend'), // Use this for anomaly score
                db.raw('AVG(cd.drought_index) as avg_drought_index'),
                // 👆 REPLACED
                db.raw('MAX(lcd.coverage_percentage) as vegetation_coverage'),
                db.raw('AVG(hfd.human_footprint_index) as human_pressure')
            )
            .groupBy('ms.id', 'ms.name', 'ms.latitude', 'ms.longitude');

        return sites;
    }

    // Calculate normalized scores (0-1) for a single site
    private static calculateSiteEHIScores(site: any): { site_id: number; scores: EHIScores } {
        // Biodiversity score based on species richness
        const biodiversity_score = this.normalize(site.species_count, 0, 50);

        // Climate score (Using temperature trend - lower magnitude of trend = better stability)
        // Assuming 'avg_temperature_trend' is a small decimal (e.g., -0.04 to 0.08)
        const climate_score = this.normalize(1 - Math.abs(site.avg_temperature_trend || 0), 0, 1); // 👈 FIXED

        // Human pressure score (invert - lower pressure = better)
        const human_pressure_score = this.normalize(1 - (site.human_pressure || 0), 0, 1);

        // Vegetation score based on coverage
        const vegetation_score = this.normalize(site.vegetation_coverage || 0, 0, 100);

        // Composite EHI (weighted average)
        const weights = { biodiversity: 0.3, climate: 0.25, human_pressure: 0.25, vegetation: 0.2 };
        const composite_ehi =
            biodiversity_score * weights.biodiversity +
            climate_score * weights.climate +
            human_pressure_score * weights.human_pressure +
            vegetation_score * weights.vegetation;

        return {
            site_id: site.id,
            scores: {
                biodiversity_score,
                climate_score,
                human_pressure_score,
                vegetation_score,
                composite_ehi
            }
        };
    }

    // Update database with calculated scores
    private static async updateSiteScores(ehiResults: any[]) {
        const updates = ehiResults.map(result =>
            db('monitoring_sites')
                .where('id', result.site_id)
                .update({
                    biodiversity_score: result.scores.biodiversity_score,
                    climate_score: result.scores.climate_score,
                    human_pressure_score: result.scores.human_pressure_score,
                    vegetation_score: result.scores.vegetation_score,
                    composite_ehi: result.scores.composite_ehi,
                    last_calculated: db.fn.now()
                })
        );

        await Promise.all(updates);
    }

    // Normalize value to 0-1 range
    private static normalize(value: number, min: number, max: number): number {
        if (value === null || value === undefined) return 0.5; // Default neutral score
        const normalized = (value - min) / (max - min);
        return Math.max(0, Math.min(1, normalized)); // Clamp to 0-1
    }
}