const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

// Initialize Stripe with your secret key
const stripe = Stripe('sk_test_51QMP7DFT9hueBpGefJyUOYEXQX5wau9Cy7idp7QdU4KTgzmS7dNelWsDMzhV9JwM2PvLVJPijUq3WOFue1wpvKxX00dAyn0whx');

// POST route to create a Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  // Ensure the amount is valid (positive number)
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  try {
    // Create a Price object dynamically based on the amount received from the client
    const price = await stripe.prices.create({
      unit_amount: amount * 100, // Convert to cents (Stripe expects the amount in the smallest currency unit)
      currency: 'usd',
      product_data: {
        name: 'Session Payment', // This is the product description for the price
      },
    });

    // Create a Checkout Session with the dynamically created price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Only accept card payments
      line_items: [
        {
          price: price.id, // Use the dynamically created price ID
          quantity: 1, // Quantity of the item (1 in this case)
        },
      ],
      mode: 'payment', // Indicating that this is a one-time payment session
      success_url: 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}', // Stripe will append the session ID here
      cancel_url: 'http://localhost:3000/payment-cancel',
    });

    // Return the session ID to the frontend
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Checkout Session:', err);
    // Handle specific Stripe error messages
    res.status(500).json({ error: 'Failed to create Checkout Session: ' + err.message });
  }
});

module.exports = router;
