const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const protect = require('../middleware/authMiddleware');

// Public Routes (Anyone can view articles)
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Protected Routes (Only registered users can create/edit/delete)
router.get('/my-articles', protect, articleController.getMyArticles);
router.post('/', protect, articleController.createArticle);
router.put('/:id', protect, articleController.updateArticle);
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
