/**
 * Weekly Payout Cron Job
 * Runs every Monday at 6:00 AM to process eligible payouts
 * 
 * Run this script with: npx ts-node src/scripts/payout.cron.ts
 * Or configure in Docker with a cron scheduler
 */

import pool from '../config/database';
import { logger } from '../utils/logger';

interface EligiblePayout {
    id: string;
    shop_id: string;
    order_id: string;
    amount: number;
    payout_eligible_at: Date;
}

async function processWeeklyPayouts(): Promise<void> {
    logger.info('Starting weekly payout processing...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Find all eligible escrow transactions
        const eligibleResult = await client.query<EligiblePayout>(`
            SELECT et.id, et.shop_id, et.order_id, et.amount, et.payout_eligible_at
            FROM escrow_transactions et
            JOIN shops s ON et.shop_id = s.id
            WHERE et.status = 'held'
              AND et.payout_eligible_at <= NOW()
              AND s.status = 'active'
            ORDER BY et.payout_eligible_at ASC
            FOR UPDATE
        `);

        logger.info(`Found ${eligibleResult.rows.length} eligible payouts`);

        let successCount = 0;
        let failCount = 0;
        let totalAmount = 0;

        for (const escrow of eligibleResult.rows) {
            try {
                // Double-check shop is not frozen/suspended
                const shopCheck = await client.query(
                    'SELECT status FROM shops WHERE id = $1',
                    [escrow.shop_id]
                );

                if (shopCheck.rows[0]?.status !== 'active') {
                    logger.warn(`Skipping payout for frozen shop ${escrow.shop_id}`);
                    continue;
                }

                // Update escrow status
                await client.query(
                    `UPDATE escrow_transactions 
                     SET status = 'released', released_at = NOW()
                     WHERE id = $1`,
                    [escrow.id]
                );

                // Create payout record
                await client.query(
                    `INSERT INTO payouts (shop_id, escrow_transaction_id, amount, status, processed_at)
                     VALUES ($1, $2, $3, 'completed', NOW())`,
                    [escrow.shop_id, escrow.id, escrow.amount]
                );

                // In production, trigger actual payment here
                // e.g., await mpesaService.sendMoney(shopBankDetails, escrow.amount);

                successCount++;
                totalAmount += parseFloat(escrow.amount.toString());

                logger.info(`Payout processed: escrow=${escrow.id}, shop=${escrow.shop_id}, amount=${escrow.amount}`);
            } catch (error) {
                failCount++;
                logger.error(`Failed to process payout for escrow ${escrow.id}:`, error);
            }
        }

        await client.query('COMMIT');

        logger.info(`Weekly payout complete: ${successCount} successful, ${failCount} failed, total amount: ${totalAmount}`);

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Weekly payout processing failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Simple cron-like scheduler (runs in-process)
function scheduleWeeklyPayout(): void {
    const checkInterval = 60 * 1000; // Check every minute

    setInterval(async () => {
        const now = new Date();

        // Run on Monday at 6:00 AM
        if (now.getDay() === 1 && now.getHours() === 6 && now.getMinutes() === 0) {
            try {
                await processWeeklyPayouts();
            } catch (error) {
                logger.error('Scheduled payout failed:', error);
            }
        }
    }, checkInterval);

    logger.info('Weekly payout scheduler started (runs every Monday at 6:00 AM)');
}

// Export for use in server.ts or run standalone
export { processWeeklyPayouts, scheduleWeeklyPayout };

// Run immediately if executed directly
if (require.main === module) {
    processWeeklyPayouts()
        .then(() => {
            logger.info('Manual payout run completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Manual payout run failed:', error);
            process.exit(1);
        });
}
