require('dotenv').config(); // Load environment variables
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

// Initialize Stripe with the secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST route to create a Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  // Validate amount and currency
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  try {
    // Create a Price object dynamically based on the amount received from the client
    const price = await stripe.prices.create({
      unit_amount: amount * 100, // Convert to cents
      currency: currency,
      product_data: {
        name: 'Session Payment', // Product description
      },
    });

    // Create a Checkout Session with the dynamically created price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Only accept card payments
      line_items: [
        {
          price: price.id, // Use the dynamically created price ID
          quantity: 1, // Quantity of the item
        },
      ],
      mode: 'payment', // One-time payment
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Dynamically use client URL
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    // Return the session ID to the frontend
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Checkout Session:', err);
    res.status(500).json({ error: 'Failed to create Checkout Session: ' + err.message });
  }
});

module.exports = router;
