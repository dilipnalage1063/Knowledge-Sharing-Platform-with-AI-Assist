const Article = require('../models/articleModel');

/**
 * Get all articles with filtering and pagination
 */
exports.getAllArticles = async (req, res, next) => {
    try {
        const { category, search, tag, page, limit } = req.query;
        const result = await Article.findAll({ category, search, tag, page, limit });

        // Convert comma-separated tags back to array
        const formattedArticles = result.articles.map(art => ({
            ...art,
            tags: art.tags ? art.tags.split(',') : []
        }));

        res.status(200).json({
            success: true,
            count: result.articles.length,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: formattedArticles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single article
 */
exports.getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        const formattedArticle = {
            ...article,
            tags: article.tags ? article.tags.split(',') : []
        };

        res.status(200).json({ success: true, data: formattedArticle });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new article
 */
exports.createArticle = async (req, res, next) => {
    try {
        const { title, content, summary, category, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        const articleData = {
            title,
            content,
            summary: summary || "",
            category: category || "General",
            author_id: req.user.id
        };

        const articleId = await Article.create(articleData, tags);

        res.status(201).json({
            success: true,
            message: "Article created successfully",
            articleId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update article (Author only)
 */
exports.updateArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        // Authorization check: Only author or admin can edit
        if (article.author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to update this article" });
        }

        const { title, content, summary, category, tags } = req.body;

        const updatedData = {
            title: title || article.title,
            content: content || article.content,
            summary: summary !== undefined ? summary : article.summary,
            category: category || article.category,
        };

        await Article.update(req.params.id, updatedData, tags);

        res.status(200).json({
            success: true,
            message: "Article updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete article (Author only)
 */
exports.deleteArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found" });
        }

        // Authorization check
        if (article.author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this article" });
        }

        await Article.delete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Article deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's articles (Dashboard)
 */
exports.getMyArticles = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const articles = await Article.findByAuthor(userId);

        const formattedArticles = articles.map(art => ({
            ...art,
            tags: art.tags ? art.tags.split(',') : []
        }));

        res.status(200).json({
            success: true,
            count: articles.length,
            data: formattedArticles
        });
    } catch (error) {
        next(error);
    }
};
