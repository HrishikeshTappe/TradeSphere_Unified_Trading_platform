import { useState } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { submitContact } from "../services/contactService";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === "") {
      return "Name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.length > 100) {
      return "Name must be less than 100 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateSubject = (subject) => {
    if (!subject || subject.trim() === "") {
      return "Subject is required";
    }
    if (subject.length < 3) {
      return "Subject must be at least 3 characters";
    }
    if (subject.length > 200) {
      return "Subject must be less than 200 characters";
    }
    return "";
  };

  const validateMessage = (message) => {
    if (!message || message.trim() === "") {
      return "Message is required";
    }
    if (message.length < 10) {
      return "Message must be at least 10 characters";
    }
    if (message.length > 2000) {
      return "Message must be less than 2000 characters";
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
      case "name":
        error = validateName(formData.name);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "subject":
        error = validateSubject(formData.subject);
        break;
      case "message":
        error = validateMessage(formData.message);
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
    setSuccess("");

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Real-time validation for touched fields
    if (touched[name]) {
      validateField(name);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.subject = validateSubject(formData.subject);
    newErrors.message = validateMessage(formData.message);

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      await submitContact(formData);

      setSuccess("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setTouched({});
      setErrors({});
    } catch (err) {
      console.error("Contact submission error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="contact-page mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="contact-card shadow-lg border-0">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Contact Us</h2>
              <p className="text-center text-muted mb-4">
                Have a question or feedback? We'd love to hear from you!
              </p>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    isInvalid={touched.name && !!errors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                  {!errors.name && touched.name && formData.name && (
                    <Form.Text className="text-success">✓ Valid name</Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    isInvalid={touched.email && !!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                  {!errors.email && touched.email && formData.email && (
                    <Form.Text className="text-success">
                      ✓ Valid email
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    name="subject"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={() => handleBlur("subject")}
                    isInvalid={touched.subject && !!errors.subject}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.subject}
                  </Form.Control.Feedback>
                  {!errors.subject && touched.subject && formData.subject && (
                    <Form.Text className="text-success">
                      ✓ Valid subject
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    placeholder="Write your message... (minimum 10 characters)"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur("message")}
                    isInvalid={touched.message && !!errors.message}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message}
                  </Form.Control.Feedback>
                  {!errors.message && touched.message && formData.message && (
                    <Form.Text className="text-success">
                      ✓ Valid message
                    </Form.Text>
                  )}
                  <Form.Text className="text-muted">
                    {formData.message.length}/2000 characters
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  variant="primary"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
