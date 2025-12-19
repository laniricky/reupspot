import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const runMigrations = async () => {
    const client = await pool.connect();

    try {
        console.log('Starting database migrations...');

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                try {
                    await client.query(sql);
                    console.log(`✓ ${file} completed`);
                } catch (err: any) {
                    // Ignore "relation already exists" and "column already exists" errors
                    // 42P07: duplicate_table
                    // 42701: duplicate_column
                    // 42710: duplicate_object (for types/indexes)
                    // 42723: duplicate_function
                    const ignoredCodes = ['42P07', '42701', '42710', '42723'];
                    if (ignoredCodes.includes(err.code)) {
                        console.log(`⚠ ${file} already applied (or partial conflict)`);
                    } else {
                        throw err;
                    }
                }
            }
        }

        console.log('All migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

runMigrations();
