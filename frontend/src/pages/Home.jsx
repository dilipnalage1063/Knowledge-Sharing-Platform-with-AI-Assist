import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });

    const categories = ['Technology', 'Programming', 'AI', 'Fullstack', 'General'];

    useEffect(() => {
        fetchArticles();
    }, [category, pagination.page]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/articles', {
                params: {
                    search,
                    category,
                    page: pagination.page,
                    limit: pagination.limit
                }
            });
            setArticles(data.data);
            setPagination(prev => ({ ...prev, total: data.total }));
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchArticles();
    };

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>AI-KnowledgeHub <span>Unified Support</span></h1>
                <p>A production-level Knowledge Sharing Platform with AI-assisted intelligence for seamless technical growth.</p>

                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by title or content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn-search">Search</button>
                </form>
            </header>

            <div className="filter-section">
                <div className="categories-chips">
                    <button
                        className={category === '' ? 'chip active' : 'chip'}
                        onClick={() => setCategory('')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={category === cat ? 'chip active' : 'chip'}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <main className="articles-grid">
                {loading ? (
                    <div className="loader">Loading articles...</div>
                ) : articles.length > 0 ? (
                    articles.map(article => (
                        <div key={article.id} className="article-card">
                            <span className="card-category">{article.category}</span>
                            <h3>{article.title}</h3>
                            <p className="article-summary">
                                {article.summary || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                            </p>
                            <div className="card-footer">
                                <span className="author">By {article.author_name}</span>
                                <Link to={`/article/${article.id}`} className="read-more">Read More →</Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No articles found matching your criteria.</div>
                )}
            </main>

            {pagination.total > pagination.limit && (
                <div className="pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
                    <button
                        disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
