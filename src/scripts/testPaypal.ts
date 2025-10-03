
// PayPal test call using fetch to your API endpoint
async function testPaypalSession() {
  try {
    const res = await fetch("/api/paypal/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "donation", amount: 10 })
    });
    const data = await res.json();
    if (data.approval_url) {
      console.log("✅ PayPal Approval URL:", data.approval_url);
    } else {
      console.error("❌ PayPal error:", data);
    }
  } catch (err) {
    console.error("❌ PayPal call failed", err);
  }
}

testPaypalSession();
