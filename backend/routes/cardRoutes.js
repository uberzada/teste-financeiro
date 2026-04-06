const express = require('express');
const router = express.Router();
const {
  getCards,
  createCard,
  updateCard,
  deleteCard,
} = require('../controllers/cardController');

const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCards).post(protect, createCard);
router.route('/:id').put(protect, updateCard).delete(protect, deleteCard);

module.exports = router;
