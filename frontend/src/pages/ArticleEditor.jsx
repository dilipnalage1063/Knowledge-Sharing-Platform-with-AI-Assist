import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';

const ArticleEditor = () => {
    const { id } = useParams(); // if present, we are editing
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Technology',
        tags: '',
        summary: ''
    });

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            const { data } = await api.get(`/articles/${id}`);
            setFormData({
                title: data.title,
                content: data.content,
                category: data.category,
                tags: data.tags.join(', '),
                summary: data.summary || ''
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

    const handleAISuggest = async () => {
        if (!formData.title || !formData.content) {
            return alert('Please enter at least a title and some content for AI to analyze.');
        }
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/improve', {
                title: formData.title,
                content: formData.content.replace(/<[^>]*>/g, '') // Strip HTML for AI
            });

            if (window.confirm('AI suggests a new title: ' + data.suggestedTitle + '\nShould we apply the improvements?')) {
                setFormData({
                    ...formData,
                    title: data.suggestedTitle,
                    content: data.improvedContent // Note: This might replace rich text if AI returns plain, usually needs careful handling
                });
            }
        } catch (error) {
            alert('AI assistant is busy. Please try again later.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleAiSummary = async () => {
        if (!formData.content) return alert('Enter content first.');
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/summary', {
                content: formData.content.replace(/<[^>]*>/g, '')
            });
            setFormData({ ...formData, summary: data.summary });
        } catch (error) {
            alert('Could not generate summary.');
        } finally {
            setAiLoading(false);
        }
    };

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
                alert('Article updated!');
            } else {
                await api.post('/articles', payload);
                alert('Article published!');
            }
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save article.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h2>{id ? 'Edit Article' : 'Create New Article'}</h2>
                <div className="ai-controls">
                    <button
                        type="button"
                        onClick={handleAISuggest}
                        className="btn-ai"
                        disabled={aiLoading}
                    >
                        {aiLoading ? 'Magic in progress...' : '✨ Improve with AI'}
                    </button>
                    <button
                        type="button"
                        onClick={handleAiSummary}
                        className="btn-ai-alt"
                        disabled={aiLoading}
                    >
                        {aiLoading ? '...' : '📝 Auto Summary'}
                    </button>
                </div>
            </div>

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
                        placeholder="Brief summary for indexing"
                    />
                </div>

                <div className="form-group rich-editor">
                    <label>Content</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        placeholder="Write your masterpiece here..."
                    />
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
