const aiService = require('../services/aiService');

/**
 * AI Assistant Controller
 */
exports.improveContent = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        const data = await aiService.improveContent(title, content);
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        next(error);
    }
};

exports.generateSummary = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const summary = await aiService.generateSummary(content);
        res.status(200).json({ success: true, summary });
    } catch (error) {
        next(error);
    }
};

exports.suggestTags = async (req, res, next) => {
    try {
        const { content, title, category } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const tags = await aiService.suggestTags(content, title || '', category || '');
        res.status(200).json({ success: true, tags });
    } catch (error) {
        next(error);
    }
};
