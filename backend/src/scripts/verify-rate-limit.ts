// @ts-nocheck
async function testRateLimit() {
    const url = 'http://localhost:3000/api/auth/login';
    const limit = 5;
    console.log(`Testing rate limit on ${url} (Limit: ${limit})...`);

    for (let i = 0; i < limit + 3; i++) {
        try {
            console.log(`Request ${i + 1}...`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'bad@test.com', password: 'bad' })
            });

            if (response.status === 429) {
                console.log('✅ Rate limit hit! Status 429 received.');
                return;
            }
            if (response.status === 401) {
                console.log('  -> Got 401 (expected).');
            } else {
                console.log(`  -> Got status ${response.status}`);
            }
        } catch (error) {
            console.error('Request failed', error);
        }
    }
    console.error('❌ Rate limit NOT hit.');
    process.exit(1);
}

testRateLimit();
