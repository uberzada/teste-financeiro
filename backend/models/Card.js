const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please add a card/wallet name'],
  },
  limit: {
    type: Number,
    required: [true, 'Please add a limit for this card'],
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
