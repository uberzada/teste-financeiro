const Card = require('../models/Card');
const Transaction = require('../models/Transaction');

// @desc    Get cards
// @route   GET /api/cards
// @access  Private
const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user.id });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create card
// @route   POST /api/cards
// @access  Private
const createCard = async (req, res) => {
  if (!req.body.name || req.body.limit === undefined) {
    return res.status(400).json({ message: 'Please add a name and limit field' });
  }

  try {
    const card = await Card.create({
      name: req.body.name,
      limit: req.body.limit,
      user: req.user.id,
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
const updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(400).json({ message: 'Card not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(400).json({ message: 'Card not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (card.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Unset the card reference from transactions so they aren't lost
    await Transaction.updateMany({ card: req.params.id }, { $unset: { card: 1 } });
    await card.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCards,
  createCard,
  updateCard,
  deleteCard,
};
