import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';

const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Per-button loading states
    const [aiLoadingImprove, setAiLoadingImprove] = useState(false);
    const [aiLoadingSummary, setAiLoadingSummary] = useState(false);
    const [aiLoadingTags, setAiLoadingTags] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Technology',
        tags: '',
        summary: ''
    });
    const [useFallback, setUseFallback] = useState(false);

    // Inline AI preview panel state
    const [aiPreview, setAiPreview] = useState(null); // { suggestedTitle, improvedContent }

    // Toast notification state
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const { data } = await api.get(`/articles/${id}`);
            const article = data.data;
            setFormData({
                title: article.title,
                content: article.content,
                category: article.category,
                tags: article.tags ? article.tags.join(', ') : '',
                summary: article.summary || ''
            });
        } catch (error) {
            console.error('Error fetching article:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContentChange = (value) => {
        setFormData({ ...formData, content: value });
    };

    const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    // ── ✨ Improve with AI ──────────────────────────────────────────
    const handleAISuggest = async () => {
        if (!formData.title || !formData.content) {
            return showToast('Please enter a title and content first.', 'error');
        }
        setAiLoadingImprove(true);
        setAiPreview(null);
        try {
            const { data } = await api.post('/ai/improve', {
                title: formData.title,
                content: stripHtml(formData.content)
            });
            if (data.success && data.suggestedTitle) {
                setAiPreview({
                    suggestedTitle: data.suggestedTitle,
                    improvedContent: data.improvedContent
                });
            } else {
                showToast('AI returned an unexpected response. Try again.', 'error');
            }
        } catch (error) {
            console.error('Improve AI error:', error);
            showToast('AI assistant is busy. Please try again shortly.', 'error');
        } finally {
            setAiLoadingImprove(false);
        }
    };

    const applyAiPreview = () => {
        if (!aiPreview) return;
        setFormData(prev => ({
            ...prev,
            title: aiPreview.suggestedTitle,
            content: aiPreview.improvedContent
        }));
        setAiPreview(null);
        showToast('✨ AI improvements applied!');
    };

    const dismissAiPreview = () => setAiPreview(null);

    // ── 📝 Auto Summary ────────────────────────────────────────────
    const handleAiSummary = async () => {
        if (!formData.content) return showToast('Enter some content first.', 'error');
        setAiLoadingSummary(true);
        try {
            const { data } = await api.post('/ai/summary', {
                content: stripHtml(formData.content)
            });
            if (data.success && data.summary) {
                setFormData(prev => ({ ...prev, summary: data.summary }));
                showToast('📝 Summary generated!');
            } else {
                showToast('Could not generate summary. Try again.', 'error');
            }
        } catch (error) {
            console.error('Summary AI error:', error);
            showToast('Could not generate summary.', 'error');
        } finally {
            setAiLoadingSummary(false);
        }
    };

    // ── 🏷️ Suggest Tags ───────────────────────────────────────────
    const handleSuggestTags = async () => {
        if (!formData.content) return showToast('Enter some content first.', 'error');
        setAiLoadingTags(true);
        try {
            const { data } = await api.post('/ai/suggest-tags', {
                content: stripHtml(formData.content),
                title: formData.title,
                category: formData.category
            });
            if (data.success && Array.isArray(data.tags) && data.tags.length > 0) {
                setFormData(prev => ({ ...prev, tags: data.tags.join(', ') }));
                showToast(`🏷️ ${data.tags.length} tags suggested!`);
            } else {
                showToast('Could not suggest tags. Try again.', 'error');
            }
        } catch (error) {
            console.error('Tags AI error:', error);
            showToast('Could not suggest tags.', 'error');
        } finally {
            setAiLoadingTags(false);
        }
    };

    // ── Submit ─────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
        };

        try {
            if (id) {
                await api.put(`/articles/${id}`, payload);
                showToast('✅ Article updated!');
            } else {
                await api.post('/articles', payload);
                showToast('🚀 Article published!');
            }
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save article.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const anyAiLoading = aiLoadingImprove || aiLoadingSummary || aiLoadingTags;

    return (
        <div className="editor-container">
            {/* Toast Notification */}
            {toast && (
                <div className={`ai-toast ${toast.type === 'error' ? 'ai-toast-error' : 'ai-toast-success'}`}>
                    {toast.message}
                </div>
            )}

            <div className="editor-header">
                <h2>{id ? 'Edit Article' : 'Create New Article'}</h2>
                <div className="ai-controls">
                    <button
                        type="button"
                        onClick={handleAISuggest}
                        className="btn-ai"
                        disabled={anyAiLoading}
                        title="Let AI rewrite and enrich your article with emojis and structure"
                    >
                        {aiLoadingImprove ? (
                            <><span className="ai-spinner" /> Polishing...</>
                        ) : '✨ Improve with AI'}
                    </button>
                    <button
                        type="button"
                        onClick={handleAiSummary}
                        className="btn-ai-alt"
                        disabled={anyAiLoading}
                        title="Generate a catchy summary for the article preview card"
                    >
                        {aiLoadingSummary ? (
                            <><span className="ai-spinner" /> Summarizing...</>
                        ) : '📝 Auto Summary'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSuggestTags}
                        className="btn-ai-alt"
                        disabled={anyAiLoading}
                        title="Let AI suggest relevant tags based on your content"
                    >
                        {aiLoadingTags ? (
                            <><span className="ai-spinner" /> Tagging...</>
                        ) : '🏷️ Suggest Tags'}
                    </button>
                </div>
            </div>

            {/* ── Inline AI Preview Panel ─────────────────────────────── */}
            {aiPreview && (
                <div className="ai-preview-panel">
                    <div className="ai-preview-header">
                        <span>✨ AI Suggestion Preview</span>
                        <button className="ai-preview-dismiss" onClick={dismissAiPreview}>✕</button>
                    </div>
                    <div className="ai-preview-body">
                        <div className="ai-preview-section">
                            <label>Suggested Title</label>
                            <p className="ai-preview-title">{aiPreview.suggestedTitle}</p>
                        </div>
                        <div className="ai-preview-section">
                            <label>Improved Content Preview</label>
                            <pre className="ai-preview-content">{aiPreview.improvedContent.substring(0, 400)}...</pre>
                        </div>
                    </div>
                    <div className="ai-preview-actions">
                        <button className="btn-apply-ai" onClick={applyAiPreview}>✅ Apply Changes</button>
                        <button className="btn-dismiss-ai" onClick={dismissAiPreview}>✕ Dismiss</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-row">
                    <div className="form-group flex-2">
                        <label>Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Give your article a catchy name"
                        />
                    </div>
                    <div className="form-group flex-1">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option>Technology</option>
                            <option>Programming</option>
                            <option>AI</option>
                            <option>Backend</option>
                            <option>Frontend</option>
                            <option>DevOps</option>
                            <option>Fullstack</option>
                            <option>General</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. react, node, tutorials"
                    />
                </div>

                <div className="form-group">
                    <label>Summary (Internal preview)</label>
                    <textarea
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        placeholder="Brief summary for indexing – or click Auto Summary to generate"
                    />
                </div>

                <div className="form-group rich-editor">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ margin: 0 }}>Content</label>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="checkbox"
                                checked={useFallback}
                                onChange={(e) => setUseFallback(e.target.checked)}
                                style={{ width: 'auto' }}
                            />
                            Use Simple Editor (Fallback)
                        </label>
                    </div>
                    {useFallback ? (
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Write your masterpiece here (Plain text mode)..."
                            style={{ minHeight: '400px', fontFamily: 'monospace' }}
                        />
                    ) : (
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            placeholder="Write your masterpiece here..."
                        />
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Saving...' : (id ? 'Update Article' : 'Publish Article')}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ArticleEditor;
