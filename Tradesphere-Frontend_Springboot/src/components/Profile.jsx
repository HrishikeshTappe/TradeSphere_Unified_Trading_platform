import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setFormData({ username: data.username });
            } else {
                setMessage('Failed to load profile.');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage('Error connecting to server.');
        }
    };

    const validateUsername = (username) => {
        if (!username || username.trim() === '') {
            return 'Username is required';
        }
        if (username.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (username.length > 20) {
            return 'Username must be less than 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return '';
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, username: value });
        setMessage('');
        
        if (touched) {
            const error = validateUsername(value);
            setErrors({ username: error });
        }
    };

    const handleUsernameBlur = () => {
        setTouched(true);
        const error = validateUsername(formData.username);
        setErrors({ username: error });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
            setErrors({ username: usernameError });
            setMessage('Please fix the errors before saving.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: formData.username })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser);
                setIsEditing(false);
                setTouched(false);
                setErrors({});
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                setMessage(errorData.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile.');
        }
    };

    if (!profile) return <div className="loading text-center mt-5">Loading Profile...</div>;

    return (
        <Container fluid className="profile-container d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col md={8} lg={6} xl={5}>
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="avatar-circle">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                            <h2>{profile.username}</h2>
                            <p className="email-text">{profile.email}</p>
                        </div>

                        {message && (
                            <Alert variant={message.includes('success') ? 'success' : 'danger'} className="text-center">
                                {message}
                            </Alert>
                        )}

                        <div className="profile-details d-flex flex-column gap-3">
                            {!isEditing ? (
                                <div className="view-mode">
                                    <div className="detail-item">
                                        <label>Username</label>
                                        <div className="value">{profile.username}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <div className="value">{profile.email}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Member Since</label>
                                        <div className="value">{new Date(profile.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <Button className="edit-btn" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                </div>
                            ) : (
                                <Form className="edit-mode" onSubmit={handleUpdate}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Username</Form.Label>
                                        <Form.Control
                                            className="form-control-custom"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleUsernameChange}
                                            onBlur={handleUsernameBlur}
                                            isInvalid={touched && !!errors.username}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.username}
                                        </Form.Control.Feedback>
                                        {!errors.username && touched && formData.username && (
                                            <Form.Text className="text-success">✓ Username looks good</Form.Text>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Email</Form.Label>
                                        <Form.Control
                                            className="form-control-custom disabled-input"
                                            type="text"
                                            value={profile.email}
                                            disabled
                                        />
                                        <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                                    </Form.Group>
                                    <div className="action-buttons">
                                        <Button type="submit" className="save-btn flex-grow-1">Save Changes</Button>
                                        <Button type="button" className="cancel-btn flex-grow-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    </div>
                                </Form>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
