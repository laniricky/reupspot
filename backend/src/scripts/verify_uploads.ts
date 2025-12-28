import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
}

const results: TestResult[] = [];

async function log(message: string) {
    console.log(`[TEST] ${message}`);
}

async function testEndpoint(name: string, testFn: () => Promise<boolean>): Promise<void> {
    try {
        const passed = await testFn();
        results.push({ name, passed, message: passed ? 'PASS' : 'FAIL' });
        log(`${passed ? '✓' : '✗'} ${name}`);
    } catch (error: any) {
        results.push({ name, passed: false, message: error.message });
        log(`✗ ${name} - ERROR: ${error.message}`);
    }
}

async function runTests() {
    console.log('\n===========================================');
    console.log('UPLOAD SYSTEM VERIFICATION');
    console.log('===========================================\n');

    let token = '';
    let uploadedFilename = '';

    // Create dummy image file
    const dummyImagePath = path.join(__dirname, 'test-image.jpg');
    // Minimal valid JPEG header + dimensions
    const jpegHeader = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb
    ]);
    fs.writeFileSync(dummyImagePath, jpegHeader);

    // 1. Login
    await testEndpoint('Login', async () => {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            emailOrPhone: 'seller1@ecommerce.local',
            password: 'seller123'
        });
        token = response.data.token;
        return !!token;
    });

    // 2. Upload Single Image
    await testEndpoint('Upload Single Image', async () => {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(dummyImagePath));

        const response = await axios.post(`${BASE_URL}/upload/image`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        if (response.data.success && response.data.url) {
            uploadedFilename = response.data.filename;
            return true;
        }
        return false;
    });

    // 3. Verify Uploaded File Access
    await testEndpoint('Verify Uploaded File Access', async () => {
        if (!uploadedFilename) return false;
        try {
            const response = await axios.get(`${BASE_URL.replace('/api', '')}/uploads/${uploadedFilename}`);
            return response.status === 200;
        } catch (e) {
            return false;
        }
    });

    // 4. Upload Multiple Images
    await testEndpoint('Upload Multiple Images', async () => {
        const formData = new FormData();
        formData.append('images', fs.createReadStream(dummyImagePath));
        formData.append('images', fs.createReadStream(dummyImagePath));

        const response = await axios.post(`${BASE_URL}/upload/images`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        return response.data.success && response.data.files.length === 2;
    });

    // 5. Delete Image
    await testEndpoint('Delete Image', async () => {
        if (!uploadedFilename) return false;
        const response = await axios.delete(`${BASE_URL}/upload/${uploadedFilename}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.success;
    });

    // Cleanup
    try {
        fs.unlinkSync(dummyImagePath);
    } catch (e) { }

    // Print Summary
    console.log('\n===========================================');
    console.log('TEST SUMMARY');
    console.log('===========================================');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.message}`);
        });
    }

    console.log('\n===========================================\n');
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
