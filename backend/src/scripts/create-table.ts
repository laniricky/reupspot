import { query } from '../config/database';

async function main() {
    try {
        console.log('Creating notifications table...');
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id),
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                data JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Notifications table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create table:', error);
        process.exit(1);
    }
}

main();
