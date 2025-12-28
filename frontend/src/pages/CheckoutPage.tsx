

export function CheckoutPage() {
    // This page is currently a placeholder as per-shop checkout is implemented in ShopCartPage.
    // We can redirect or show a message.

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <p className="text-gray-600">
                To checkout, please go to a specific shop and use the cart.
            </p>
            <div className="mt-8">
                <a href="/shops" className="text-blue-600 hover:underline">
                    Browse Shops
                </a>
            </div>
        </div>
    );
}

// NOTE: Since the backend is "per-shop cart", a global checkout page is complex.
// Instead, adding a "Cart Drawer" or "Cart Page" per shop is better.
// I will create a `ShopCartPage` instead.
