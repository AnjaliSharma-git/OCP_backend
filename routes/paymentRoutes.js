require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  try {
    const price = await stripe.prices.create({
      unit_amount: amount * 100, 
      currency: currency,
      product_data: {
        name: 'Session Payment', 
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      line_items: [
        {
          price: price.id, 
          quantity: 1, 
        },
      ],
      mode: 'payment', 
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Dynamically use client URL
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating Checkout Session:', err);
    res.status(500).json({ error: 'Failed to create Checkout Session: ' + err.message });
  }
});

module.exports = router;
