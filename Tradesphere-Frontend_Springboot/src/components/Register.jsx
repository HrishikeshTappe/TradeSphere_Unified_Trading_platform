// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import './Auth.css';

// const Register = () => {
//     const [user, setUser] = useState({ username: '', email: '', password: '' });
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setUser({ ...user, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post('http://localhost:8080/api/auth/register', user);
//             alert("Registration Successful! Please Login. 🎉");
//             navigate('/login');
//         } catch (error) {
//             console.error("Registration Error:", error);
//             if (error.response) {
//                 let errorMsg = error.response.data;
//                 if (typeof errorMsg === 'object') {
//                     errorMsg = JSON.stringify(errorMsg);
//                 }
//                 alert("Registration Failed: " + (errorMsg || error.response.statusText));
//             } else {
//                 alert("An error occurred. Please try again.");
//             }
//         }
//     };

//     return (
//         <div className="auth-container">
//             <div className="auth-box">
//                 <h2>Create Account</h2>
//                 <form className="auth-form" onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label>Username</label>
//                         <input
//                             type="text"
//                             name="username"
//                             placeholder="Choose a username"
//                             value={user.username}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label>Email</label>
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Enter your email"
//                             value={user.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <label>Password</label>
//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Create a password"
//                             value={user.password}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <button type="submit" className="auth-btn">Sign Up</button>
//                 </form>
//                 <div className="auth-footer">
//                     Already have an account? <Link to="/login">Login</Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;
import { useState } from "react";
import { Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Validation functions
  const validateUsername = (username) => {
    if (!username) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (phoneNumber && phoneNumber.trim() !== "") {
      const phoneRegex =
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        return "Please enter a valid phone number";
      }
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (password.length > 50) {
      return "Password must be less than 50 characters";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    let error = "";
    switch (field) {
      case "username":
        error = validateUsername(formData.username);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(formData.phoneNumber);
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(
          formData.confirmPassword,
          formData.password,
        );
        break;
      default:
        break;
    }
    setErrors({ ...errors, [field]: error });
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Real-time validation for touched fields
    if (touched[name]) {
      validateField(name);
    }

    // If password changes, re-validate confirm password
    if (name === "password" && touched.confirmPassword) {
      validateField("confirmPassword");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(
      formData.confirmPassword,
      formData.password,
    );

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    return Object.values(newErrors).every((err) => err === "");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
      });

      setSuccess("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      let errMsg = "Registration failed";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errMsg = err.response.data;
        } else if (typeof err.response.data === "object") {
          // Spring Boot default error structure: { timestamp, status, error, path }
          errMsg =
            err.response.data.message ||
            err.response.data.error ||
            JSON.stringify(err.response.data);
        }
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="auth-container d-flex align-items-center justify-content-center"
    >
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6} xl={4}>
          <div className="auth-box">
            <h2 className="text-center mb-4">Register</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  name="username"
                  placeholder="Enter username (3-20 characters, letters, numbers, underscores)"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur("username")}
                  isInvalid={touched.username && !!errors.username}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
                {!errors.username && touched.username && (
                  <Form.Text className="text-success">
                    ✓ Username looks good
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  isInvalid={touched.email && !!errors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                {!errors.email && touched.email && (
                  <Form.Text className="text-success">✓ Valid email</Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phoneNumber")}
                  isInvalid={touched.phoneNumber && !!errors.phoneNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phoneNumber}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password (minimum 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  isInvalid={touched.password && !!errors.password}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
                {!errors.password && touched.password && (
                  <Form.Text className="text-success">
                    ✓ Strong password
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  isInvalid={
                    touched.confirmPassword && !!errors.confirmPassword
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
                {!errors.confirmPassword &&
                  touched.confirmPassword &&
                  formData.confirmPassword && (
                    <Form.Text className="text-success">
                      ✓ Passwords match
                    </Form.Text>
                  )}
              </Form.Group>

              <Button
                type="submit"
                className="auth-btn w-100"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>

              <p className="mt-3 text-center auth-footer">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
