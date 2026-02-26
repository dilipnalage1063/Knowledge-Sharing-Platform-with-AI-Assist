const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const protect = require('../middleware/authMiddleware');

// Public Routes (Anyone can view articles)
router.get('/', articleController.getAllArticles);
// Protected Routes
router.get('/my-articles', protect, articleController.getMyArticles);
router.post('/', protect, articleController.createArticle);

// ID-based Routes
router.get('/:id', articleController.getArticleById);
router.put('/:id', protect, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
