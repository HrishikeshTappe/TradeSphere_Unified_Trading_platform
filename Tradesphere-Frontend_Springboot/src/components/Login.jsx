import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import './Auth.css';

const Login = ({ setIsAuthenticated }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Validation functions
    const validateEmail = (email) => {
        if (!email) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        validateField(field, credentials[field]);
    };

    const validateField = (field, value) => {
        let error = '';
        switch (field) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            default:
                break;
        }
        setErrors({ ...errors, [field]: error });
        return !error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        setErrorMessage('');
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        
        // Real-time validation for touched fields
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailError = validateEmail(credentials.email);
        const passwordError = validatePassword(credentials.password);
        
        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
        
        setErrors(newErrors);
        setTouched({ email: true, password: true });
        
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                var role = localStorage.getItem('role');
                setIsAuthenticated(true);
                alert("Login Successful! 🚀");
                if (role === "ADMIN") {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/trade'); // Redirect to Trade page
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setErrorMessage(errorData.message || 'Login Failed. Please check your credentials.');
            }
        } catch (error) {
            console.error("Login Error:", error);
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="auth-container d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col md={8} lg={5} xl={4}>
                    <div className="auth-box">
                        <h2 className="text-center">TradeSphere Login</h2>
                        
                        {errorMessage && (
                            <Alert variant="danger" className="mb-3">
                                {errorMessage}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                    isInvalid={touched.email && !!errors.email}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                    isInvalid={touched.password && !!errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button 
                                type="submit" 
                                className="auth-btn w-100" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Form>
                        <div className="auth-footer">
                            Don't have an account? <Link to="/register">Sign Up</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;