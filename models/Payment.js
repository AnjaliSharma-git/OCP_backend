const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  paymentDate: { type: Date, default: Date.now },
  sessionId: { type: String, required: true }, // For payment session ID
});

module.exports = mongoose.model("Payment", paymentSchema);
