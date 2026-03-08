const express = require('express');
const { createComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createComment)
    .get(protect, getComments);

module.exports = router;
