
// Stripe test call using fetch to your API endpoint
async function testStripeSession() {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "test-plan", quantity: 1 })
    });
    const data = await res.json();
    if (data.url) {
      console.log("✅ Stripe Checkout URL:", data.url);
    } else {
      console.error("❌ Stripe error:", data);
    }
  } catch (err) {
    console.error("❌ Stripe call failed", err);
  }
}

testStripeSession();
