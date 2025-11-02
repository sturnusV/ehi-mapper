import cron from 'node-cron';
import { DataIngestionService } from './dataIngestion';
import { EHICalculator } from './ehiCalculator';

export class AutomationScheduler {
    static initialize() {
        console.log('⏰ Initializing data automation scheduler...');

        // Test data refresh on startup
        setTimeout(async () => {
            console.log('🔄 Running initial data refresh...');
            try {
                await this.runFullDataPipeline();
                console.log('✅ Initial data refresh completed');
            } catch (error) {
                console.error('❌ Initial data refresh failed:', error);
            }
        }, 15000); // Wait 15 seconds for DB to be ready

        // Daily data refresh at 2 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('🔄 Starting scheduled data update...');
            try {
                await this.runFullDataPipeline();
                console.log('✅ Scheduled data update completed');
            } catch (error) {
                console.error('❌ Scheduled data update failed:', error);
            }
        });

        console.log('✅ Automation scheduler initialized');
    }

    static async runFullDataPipeline(): Promise<void> {
        console.log('🔄 Starting full data pipeline...');

        try {
            // Step 1: Fetch all data sources
            await DataIngestionService.fetchGBIFData();
            await DataIngestionService.fetchWorldClimData();
            await DataIngestionService.fetchLandCoverData();
            await DataIngestionService.fetchHumanFootprintData();

            // Step 2: Calculate EHI scores (using simple calculator)
            await EHICalculator.calculateAllSites();

            console.log('✅ Full data pipeline completed successfully');
        } catch (error) {
            console.error('❌ Data pipeline failed:', error);
            throw error;
        }
    }
}