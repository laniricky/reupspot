import { query } from '../config/database';
import bcrypt from 'bcrypt';

async function createAdmin() {
    const email = 'admin@ecommerce.local';
    const password = 'adminpassword123';
    const phone = '0000000000';

    try {
        console.log(`Checking if admin user ${email} exists...`);
        const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (userRes.rows.length > 0) {
            console.log('Admin user already exists.');
            // Update role just in case
            await query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
            console.log('Role updated to admin.');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(password, 10);

            await query(
                `INSERT INTO users (email, password_hash, role, phone, email_verified, phone_verified)
                 VALUES ($1, $2, 'admin', $3, true, true)
                 RETURNING id, email, role`,
                [email, hashedPassword, phone]
            );
            console.log(`Admin user created: ${email} / ${password}`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin user:', error);
        process.exit(1);
    }
}

createAdmin();
