const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client only if key is present
const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * AI Service for Article Assistance
 */
const aiService = {
    /**
     * Improve content and title
     */
    improveContent: async (title, content) => {
        if (!openai) return aiService.mockImproveContent(title, content);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a professional writing assistant. Improve the given title and article content for better flow, grammar, and engagement. Return a JSON object with 'suggestedTitle' and 'improvedContent' fields." },
                    { role: "user", content: `Title: ${title}\nContent: ${content}` }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error("AI API Error (Improve):", error.message);
            return aiService.mockImproveContent(title, content);
        }
    },

    /**
     * Generate a summary for article cards
     */
    generateSummary: async (content) => {
        if (!openai) return aiService.mockGenerateSummary(content);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Summarize the article in exactly one or two catchy sentences (max 150 characters) for a preview card." },
                    { role: "user", content: content }
                ]
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error("AI API Error (Summary):", error.message);
            return aiService.mockGenerateSummary(content);
        }
    },

    /**
     * Suggest tags based on content
     */
    suggestTags: async (content) => {
        if (!openai) return aiService.mockSuggestTags(content);

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Based on the content, suggest 3-5 relevant short tags (e.g., 'React', 'AI', 'Tutorial'). Return a JSON object with a 'tags' array." },
                    { role: "user", content: content }
                ],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content).tags;
        } catch (error) {
            console.error("AI API Error (Tags):", error.message);
            return aiService.mockSuggestTags(content);
        }
    },

    // --- Mock Implementations (Fallbacks) ---

    mockImproveContent: (title, content) => {
        return {
            suggestedTitle: `✨ [Refined] ${title}`,
            improvedContent: `${content}\n\n(AI Assist: I've polished your text for better readability and tone.)`
        };
    },

    mockGenerateSummary: (content) => {
        const text = content.replace(/<[^>]*>/g, '').substring(0, 120);
        return `${text}... (Read more to explore this fascinating take on the topic!)`;
    },

    mockSuggestTags: (content) => {
        const keywords = ['React', 'JavaScript', 'Node.js', 'Web Dev', 'AI', 'Technology', 'Architecture'];
        const contentLower = content.toLowerCase();
        const suggested = keywords.filter(k => contentLower.includes(k.toLowerCase()));
        return suggested.length > 0 ? suggested : ['Knowledge', 'Article', 'Sharing'];
    }
};

module.exports = aiService;
