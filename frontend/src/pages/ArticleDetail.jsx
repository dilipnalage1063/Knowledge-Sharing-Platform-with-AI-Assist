import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/articles/${id}`);
                setArticle(data.data);
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return <div className="loader">Loading article...</div>;
    if (!article) return <div className="error">Article not found.</div>;

    return (
        <article className="article-detail">
            <header className="article-header">
                <Link to="/" className="back-link">← Back to Articles</Link>
                <div className="auth-actions">
                    {user && user.username === article.author_name && (
                        <div className="admin-buttons">
                            <Link to={`/edit/${article.id}`} className="btn-edit">Edit Article</Link>
                        </div>
                    )}
                </div>
                <div className="meta">
                    <span className="category-tag">{article.category}</span>
                    <span className="date">{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
                <h1>{article.title}</h1>
                <div className="author-info">
                    By <strong>{article.author_name}</strong>
                </div>
            </header>

            {article.summary && (
                <div className="article-summary-box">
                    <strong>AI Summary:</strong>
                    <p>{article.summary}</p>
                </div>
            )}

            <main
                className="article-content ql-editor"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            />

            <footer className="article-footer">
                <div className="tags">
                    {article.tags && article.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                </div>
            </footer>
        </article>
    );
};

export default ArticleDetail;
