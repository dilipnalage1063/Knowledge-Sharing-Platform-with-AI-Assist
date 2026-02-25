import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyArticles();
    }, []);

    const fetchMyArticles = async () => {
        try {
            const { data } = await api.get('/articles/my-articles');
            setArticles(data.data);
        } catch (error) {
            console.error('Error fetching your articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;

        try {
            await api.delete(`/articles/${id}`);
            setArticles(articles.filter(a => a.id !== id));
            alert('Article deleted successfully.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete article.');
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h2>My Dashboard</h2>
                <Link to="/create" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                    + Write New Article
                </Link>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h4>Total Articles</h4>
                    <p>{articles.length}</p>
                </div>
            </div>

            <div className="articles-list-table">
                {loading ? (
                    <p>Loading your articles...</p>
                ) : articles.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id}>
                                    <td>{article.title}</td>
                                    <td><span className="chip">{article.category}</span></td>
                                    <td>{new Date(article.created_at).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <Link to={`/edit/${article.id}`} className="btn-edit">Edit</Link>
                                        <button onClick={() => handleDelete(article.id)} className="btn-delete">Delete</button>
                                        <Link to={`/article/${article.id}`} className="btn-view">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <p>You haven't written any articles yet.</p>
                        <Link to="/create" className="btn-link">Write your first article now!</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
