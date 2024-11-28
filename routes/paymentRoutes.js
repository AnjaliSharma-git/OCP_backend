const stripe = require('stripe')('your_stripe_secret_key');
const express = require('express');
const router = express.Router();

// Create a payment session for Stripe
router.post('/payment', async (req, res) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Counseling Session',
            },
            unit_amount: amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment session' });
  }
});

module.exports = router;
