const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative number'],
  },
  category: {
    type: String,
    required: [true, 'Please assign a category'],
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['receita', 'despesa'],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
