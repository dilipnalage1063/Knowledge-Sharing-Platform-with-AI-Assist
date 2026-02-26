const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Get a Gemini model instance (gemini-2.0-flash)
 */
function getModel(jsonMode = false) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {}
    });
}

/**
 * Safely parse JSON — strip markdown fences if Gemini adds them
 */
function safeParseJSON(text) {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned);
}

/**
 * AI Service for Article Assistance
 */
const aiService = {

    /**
     * Improve content and title – returns { suggestedTitle, improvedContent }
     */
    improveContent: async (title, content) => {
        const model = getModel(true);
        if (!model) return aiService.mockImproveContent(title, content);

        try {
            const prompt = `You are an expert technical content writer. Improve the article title and content significantly.

Rules:
1. 🎯 Make the title more compelling, specific, and professional.
2. ✨ Use relevant emojis throughout — in headings, key points, tips, and callouts.
3. 📝 Enrich and expand the content — add depth, real examples, explanations. Never shorten.
4. 🔧 Fix all grammar, spelling, and flow issues.
5. 📚 Structure with clear markdown headings (## Heading), bullet points, numbered lists.
6. 💡 Add a compelling intro paragraph and a strong "## 🎯 Key Takeaways" section.
7. 🏷️ Add "**Pro Tip:** ..." callouts where relevant.
8. Preserve original meaning — make it richer and more professional.

Return ONLY a valid JSON object with:
- "suggestedTitle": the improved title (string)
- "improvedContent": the full improved markdown content (string)

Article Title: ${title}
Article Content: ${content}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return safeParseJSON(text);
        } catch (error) {
            console.error('AI API Error (Improve):', error.message);
            return aiService.mockImproveContent(title, content);
        }
    },

    /**
     * Generate an engaging summary for article preview cards
     */
    generateSummary: async (content) => {
        const model = getModel(false);
        if (!model) return aiService.mockGenerateSummary(content);

        try {
            const prompt = `You are a content marketing expert. Write a captivating 1–2 sentence article preview for a card display.

Rules:
1. Use 1–2 relevant emojis naturally within the text (not as prefix).
2. Make it punchy, curiosity-inducing — like a tweet that makes you want to click.
3. Keep it under 200 characters total.
4. Do NOT start with "This article…" or "In this post…".
5. Return ONLY the plain preview text — no JSON, no quotes, no extra formatting.

Article content:
${content}`;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('AI API Error (Summary):', error.message);
            return aiService.mockGenerateSummary(content);
        }
    },

    /**
     * Suggest relevant tags based on title, category, and content
     */
    suggestTags: async (content, title = '', category = '') => {
        const model = getModel(true);
        if (!model) return aiService.mockSuggestTags(content);

        try {
            const contextInfo = [
                title ? `Title: ${title}` : '',
                category ? `Category: ${category}` : '',
                `Content: ${content}`
            ].filter(Boolean).join('\n');

            const prompt = `You are a technical content tagging expert. Suggest 4–6 precise, relevant tags for an article.

Rules:
1. Tags must be short (1–3 words), specific, and searchable — like "React Hooks", "REST API", "Machine Learning".
2. Mix broad category tags (e.g., "JavaScript") with specific topic tags (e.g., "useState", "Custom Hooks").
3. Avoid generic fillers like "Article", "Blog", "Post", "Content".
4. Base tags on the title, category, AND content provided.
5. Return ONLY a JSON object with a "tags" array of strings.

${contextInfo}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = safeParseJSON(text);
            return Array.isArray(parsed.tags) ? parsed.tags : [];
        } catch (error) {
            console.error('AI API Error (Tags):', error.message);
            return aiService.mockSuggestTags(content);
        }
    },

    // --- Mock Implementations (Fallbacks when API key is missing) ---

    mockImproveContent: (title, content) => {
        return {
            suggestedTitle: `✨ ${title} — A Complete Guide`,
            improvedContent: `## 🚀 Introduction\n\n${content}\n\n## 📌 Key Takeaways\n\n- This topic is essential for modern development\n- Practice regularly to master these concepts\n- Explore the official documentation for deeper insights\n\n> **Pro Tip:** 💡 Consistent practice is the key to mastery!\n\n(AI Assist: I've polished your text for better readability and tone.)`
        };
    },

    mockGenerateSummary: (content) => {
        const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 130);
        return `${text}... 🚀 Dive in to master this essential concept!`;
    },

    mockSuggestTags: (content) => {
        const keywords = ['React', 'JavaScript', 'Node.js', 'Web Dev', 'AI', 'Technology', 'Architecture', 'Python', 'CSS', 'API'];
        const contentLower = content.toLowerCase();
        const suggested = keywords.filter(k => contentLower.includes(k.toLowerCase()));
        return suggested.length > 0 ? suggested.slice(0, 5) : ['Knowledge Sharing', 'Tutorial', 'Development'];
    }
};

module.exports = aiService;
