import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  tickets: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // tickets * ticketPrice
  adminCommission: { type: Number, required: true }, // 5% of totalPrice
  organizerRevenue: { type: Number, required: true }, // 95% of totalPrice
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String } // optional, if integrating payment gateway
}, {
  collection: 'payments'
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
