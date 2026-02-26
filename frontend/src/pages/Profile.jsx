import { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        bio: '',
        expertise: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setProfile({
                username: data.data.username,
                email: data.data.email,
                bio: data.data.bio || '',
                expertise: data.data.expertise || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('/auth/profile', {
                bio: profile.bio,
                expertise: profile.expertise
            });
            setMessage('Profile updated successfully! ✨');
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loader">Loading profile...</div>;

    return (
        <div className="auth-card" style={{ maxWidth: '600px' }}>
            <h2>User Profile</h2>
            <p>Manage your professional identity and expertise.</p>

            {message && <div style={{
                padding: '15px',
                backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.includes('success') ? '#10b981' : '#ef4444',
                borderRadius: '10px',
                marginBottom: '20px',
                fontWeight: '600'
            }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text" value={profile.username} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="text" value={profile.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                    <label>Expertise</label>
                    <input
                        type="text"
                        placeholder="e.g. Full Stack Web Developer"
                        value={profile.expertise}
                        onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <textarea
                        placeholder="Tell the community about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        style={{ minHeight: '120px' }}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default Profile;
