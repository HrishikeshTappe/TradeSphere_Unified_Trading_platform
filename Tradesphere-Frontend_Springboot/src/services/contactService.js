import axios from "axios";

const API = "http://localhost:8080";

// PUBLIC – Submit contact form
export const submitContact = (contactData) => {
  return axios.post(`${API}/api/contact`, contactData);
};

// ADMIN – Get all contacts
export const getAllContacts = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/api/contact`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ADMIN – Get contact by id
export const getContactById = (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/api/contact/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
