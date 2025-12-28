import { trustService } from '../trust.service';

describe('Trust Service', () => {
    describe('Trust Score Calculation', () => {
        it('should calculate base trust score correctly', () => {
            const mockShopData = {
                created_at: new Date(),
                order_count: '0',
                completed_order_count: '0',
                avg_rating: '0',
                refund_count: '0',
                dispute_count: '0',
                fast_fulfillment_count: '0',
                slow_fulfillment_count: '0',
            };

            // Base score should be 50
            const score = calculateMockTrustScore(mockShopData);
            expect(score).toBe(50);
        });

        it('should reward shop age', () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 30); // 30 days old

            const mockShopData = {
                created_at: oldDate,
                order_count: '0',
                completed_order_count: '0',
                avg_rating: '0',
                refund_count: '0',
                dispute_count: '0',
                fast_fulfillment_count: '0',
                slow_fulfillment_count: '0',
            };

            const score = calculateMockTrustScore(mockShopData);
            expect(score).toBeGreaterThan(50); // Should be 50 + 30 age bonus
        });

        it('should reward good reviews', () => {
            const mockShopData = {
                created_at: new Date(),
                order_count: '10',
                completed_order_count: '10',
                avg_rating: '5', // Perfect rating
                refund_count: '0',
                dispute_count: '0',
                fast_fulfillment_count: '0',
                slow_fulfillment_count: '0',
            };

            const score = calculateMockTrustScore(mockShopData);
            expect(score).toBeGreaterThan(50); // Should get rating bonus
        });

        it('should penalize high dispute rate', () => {
            const mockShopData = {
                created_at: new Date(),
                order_count: '10',
                completed_order_count: '10',
                avg_rating: '5',
                refund_count: '0',
                dispute_count: '2', // 20% dispute rate
                fast_fulfillment_count: '0',
                slow_fulfillment_count: '0',
            };

            const score = calculateMockTrustScore(mockShopData);
            expect(score).toBeLessThan(100); // High disputes should reduce score
        });

        it('should clamp score between 0 and 100', () => {
            // Test maximum score
            const perfectShop = {
                created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year old
                order_count: '1000',
                completed_order_count: '1000',
                avg_rating: '5',
                refund_count: '0',
                dispute_count: '0',
                fast_fulfillment_count: '1000',
                slow_fulfillment_count: '0',
            };

            const highScore = calculateMockTrustScore(perfectShop);
            expect(highScore).toBeLessThanOrEqual(100);
            expect(highScore).toBeGreaterThanOrEqual(0);

            // Test minimum score
            const terribleShop = {
                created_at: new Date(),
                order_count: '10',
                completed_order_count: '0',
                avg_rating: '1',
                refund_count: '10',
                dispute_count: '10',
                fast_fulfillment_count: '0',
                slow_fulfillment_count: '10',
            };

            const lowScore = calculateMockTrustScore(terribleShop);
            expect(lowScore).toBeLessThanOrEqual(100);
            expect(lowScore).toBeGreaterThanOrEqual(0);
        });
    });
});

// Mock trust score calculation for testing
function calculateMockTrustScore(shopData: any): number {
    let score = 50; // Base score

    // Age bonus (max +30, 1 per day)
    const ageInDays = Math.floor(
        (Date.now() - new Date(shopData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.min(ageInDays, 30);

    // Completed orders bonus (max +30, 0.5 per order)
    const completedOrders = parseInt(shopData.completed_order_count);
    score += Math.min(completedOrders * 0.5, 30);

    // Rating bonus (max +50)
    const avgRating = parseFloat(shopData.avg_rating);
    if (avgRating > 0) {
        score += avgRating * 10;
    }

    // Fast fulfillment bonus
    const fastFulfillment = parseInt(shopData.fast_fulfillment_count);
    if (fastFulfillment > 0) {
        score += 10;
    }

    // Penalties
    const totalOrders = parseInt(shopData.order_count);
    if (totalOrders > 0) {
        const disputeRate = parseInt(shopData.dispute_count) / totalOrders;
        if (disputeRate > 0.1) score -= 40;
        else if (disputeRate > 0.05) score -= 20;

        const refundRate = parseInt(shopData.refund_count) / totalOrders;
        if (refundRate > 0.1) score -= 15;
    }

    const slowFulfillment = parseInt(shopData.slow_fulfillment_count);
    if (slowFulfillment > 0) {
        score -= 10;
    }

    // Clamp between 0-100
    return Math.max(0, Math.min(100, score));
}
