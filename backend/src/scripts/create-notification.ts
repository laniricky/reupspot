import { query } from '../config/database';

async function main() {
    try {
        const userRes = await query("SELECT id FROM users WHERE email='seller1@ecommerce.local'");
        if (userRes.rows.length === 0) {
            console.error('User not found');
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        await query(
            "INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, 'system', 'Welcome!', 'Welcome to the notification system.', '{}')",
            [userId]
        );
        console.log('Test notification created for ' + userId);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
