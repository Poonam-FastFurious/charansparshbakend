import Transaction from './transaction.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

// Get all transactions
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({});
  if (!transactions) {
    throw new ApiError(404, 'No transactions found');
  }
  res.status(200).json(new ApiResponse(200, transactions, 'Transactions fetched successfully'));
});

// Add a new transaction
const addTransaction = asyncHandler(async (req, res) => {
  const { customerEmail, transactionId, orderStatus, paymentStatus, totalAmount } = req.body;

  if (!customerEmail || !transactionId || !orderStatus || !paymentStatus || !totalAmount) {
    throw new ApiError(400, 'All fields are required');
  }

  const transaction = new Transaction({
    customerEmail,
    transactionId,
    vendorId,
    productId,
    orderStatus,
    paymentStatus,
    totalAmount
  });

  await transaction.save();

  res.status(201).json(new ApiResponse(201, transaction, 'Transaction added successfully'));
});

// Delete a transaction
const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findByIdAndDelete(id);

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  res.status(200).json(new ApiResponse(200, {}, 'Transaction deleted successfully'));
});

export {
  getTransactions,
  addTransaction,
  deleteTransaction
};
