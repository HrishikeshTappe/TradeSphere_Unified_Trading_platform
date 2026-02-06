import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Badge, Card, Form, Row, Col, Nav, Modal, Alert } from "react-bootstrap";
import { getAllContacts, getContactById } from "../services/contactService";
import "./AdminDashboard.css";

const API = "http://localhost:8080";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users"); // "users" or "contacts"
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Validation functions
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

  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (phoneNumber && phoneNumber.trim() !== '') {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  };

  // SAME LOGIC – function declaration
  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data);
    } catch (error) {
      console.error("Fetch users error:", error);

      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        alert("Access Denied: You must be an ADMIN.");
        navigate("/");
      }
    }
  }

  // Fetch contacts
  async function fetchContacts() {
    try {
      setLoading(true);
      setError("");
      const res = await getAllContacts();
      setContacts(res.data);
    } catch (error) {
      console.error("Fetch contacts error:", error);
      setError("Failed to load contacts. " + (error.response?.data?.message || error.message));
      
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        alert("Access Denied: You must be an ADMIN.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  // Fetch contact details
  const handleViewContact = async (id) => {
    try {
      const res = await getContactById(id);
      setSelectedContact(res.data);
      setShowContactModal(true);
    } catch (error) {
      console.error("Fetch contact error:", error);
      alert("Failed to load contact details: " + (error.response?.data?.message || error.message));
    }
  };

  // Delete contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContacts();
      alert("Contact deleted successfully!");
    } catch (error) {
      alert("Delete failed: " + (error.response?.data?.message || error.message));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "contacts") {
      fetchContacts();
    }
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role || "USER",
      phoneNumber: user.phoneNumber || "",
    });
    setErrors({});
    setTouched({});
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // Real-time validation for touched fields
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }
    setErrors({ ...errors, [field]: error });
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    
    setErrors(newErrors);
    setTouched({ username: true, email: true, phoneNumber: true });
    
    return Object.values(newErrors).every(err => err === '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/api/admin/users/${editingUser.id}`,
        {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditingUser(null);
      setErrors({});
      setTouched({});
      fetchUsers();
      alert("User updated successfully!");
    } catch (error) {
      alert("Update failed: " + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Container className="admin-container">
      <h2 className="mb-4 text-center">Admin Dashboard 🛡️</h2>

      {/* Tabs */}
      <Nav variant="tabs" className="mb-4" defaultActiveKey="users">
        <Nav.Item>
          <Nav.Link
            eventKey="users"
            onClick={() => setActiveTab("users")}
            active={activeTab === "users"}
          >
            👥 Users Management
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="contacts"
            onClick={() => setActiveTab("contacts")}
            active={activeTab === "contacts"}
          >
            📧 Contact Messages ({contacts.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Users Tab */}
      {activeTab === "users" && (
        <>

      {editingUser && (
        <Card className="mb-4 bg-dark text-white border-secondary">
          <Card.Header>Edit User</Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpdate}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="text-light">Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    onBlur={() => handleFieldBlur('username')}
                    isInvalid={touched.username && !!errors.username}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="text-light">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    isInvalid={touched.email && !!errors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="text-light">Role</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="text-light">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    onBlur={() => handleFieldBlur('phoneNumber')}
                    isInvalid={touched.phoneNumber && !!errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <div className="table-responsive">
        <Table hover variant="dark" className="table-custom">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const role = user.role || "USER";

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={role === 'ADMIN' ? 'danger' : 'success'}>
                      {role}
                    </Badge>
                  </td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      </>
      )}

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
        <>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          {loading ? (
            <div className="text-center p-4">
              <p>Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <Card className="text-center p-4">
              <Card.Body>
                <p className="mb-0">No contact messages yet.</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="table-responsive">
              <Table hover variant="dark" className="table-custom">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.id}</td>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>
                        <span
                          style={{
                            maxWidth: "200px",
                            display: "inline-block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={contact.subject}
                        >
                          {contact.subject}
                        </span>
                      </td>
                      <td>{formatDate(contact.createdAt)}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewContact(contact.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Contact Detail Modal */}
          <Modal
            show={showContactModal}
            onHide={() => setShowContactModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Contact Message Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedContact && (
                <div>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>ID:</strong>
                    </Col>
                    <Col md={8}>{selectedContact.id}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>Name:</strong>
                    </Col>
                    <Col md={8}>{selectedContact.name}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>Email:</strong>
                    </Col>
                    <Col md={8}>
                      <a href={`mailto:${selectedContact.email}`}>
                        {selectedContact.email}
                      </a>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>Subject:</strong>
                    </Col>
                    <Col md={8}>{selectedContact.subject}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={4}>
                      <strong>Date:</strong>
                    </Col>
                    <Col md={8}>{formatDate(selectedContact.createdAt)}</Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <strong>Message:</strong>
                    </Col>
                    <Col md={8}>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          padding: "10px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "5px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        {selectedContact.message}
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowContactModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
}
