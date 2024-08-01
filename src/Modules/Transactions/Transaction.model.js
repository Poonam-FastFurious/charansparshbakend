import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },
    transactionId: { type: String, required: true },
    productId: { type: String, required: true },
    vendorId: { type: String, required: true },
    orderStatus: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
