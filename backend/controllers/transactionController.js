const Transaction = require('../models/Transaction');

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    // Optional query params for month/year filter
    const { month, year } = req.query;
    let query = { user: req.user.id };

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // end of month
        query.date = { $gte: startDate, $lte: endDate };
    }

    const transactions = await Transaction.find(query)
      .populate('card', 'name limit')
      .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    // ensure amount is positive or negative based on type
    const { description, amount, category, date, type, card } = req.body;

    let finalAmount = Math.abs(amount);
    if (type === 'despesa') finalAmount = -finalAmount;

    const transaction = await Transaction.create({
      description,
      amount: finalAmount,
      category,
      type,
      card: card || undefined,
      date: date ? new Date(date + 'T12:00:00') : new Date(),
      user: req.user.id,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Check for user
      if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
      }
  
      let finalAmount = undefined;
      if (req.body.amount || req.body.type) {
         let type = req.body.type || transaction.type;
         let amount = req.body.amount || Math.abs(transaction.amount);
         finalAmount = Math.abs(amount);
         if (type === 'despesa') finalAmount = -finalAmount;
      }

      const updateData = { ...req.body };
      if (finalAmount !== undefined) updateData.amount = finalAmount;
      if (req.body.date && typeof req.body.date === 'string' && req.body.date.length <= 10) {
        updateData.date = new Date(req.body.date + 'T12:00:00');
      }
  
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
  
      res.status(200).json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check for user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
