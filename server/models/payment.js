import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  gateway: { type: String, enum: ['mock', 'razorpay'], default: 'razorpay' },
  tickets: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // tickets * ticketPrice
  adminCommission: { type: Number, required: true }, // 5% of totalPrice
  organizerRevenue: { type: Number, required: true }, // 95% of totalPrice
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  preferredMethod: { type: String, enum: ['card', 'upi'] },
  leadName: { type: String },
  leadEmail: { type: String },
  additionalEmails: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  refundAmount: { type: Number, default: 0 },
  refundDate: { type: Date },
  refundedTickets: { type: Number, default: 0 }
}, {
  collection: 'payments'
});

// --- Indexes ---
// Organizer dashboard aggregations: match by event + status + date range
PaymentSchema.index({ eventId: 1, status: 1, paymentDate: -1 });
// User payment history page
PaymentSchema.index({ userId: 1, paymentDate: -1 });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
