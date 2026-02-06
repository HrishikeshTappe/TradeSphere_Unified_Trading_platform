import axios from "axios";

const API = "http://localhost:8080"; // HTTP ONLY

export const getPortfolio = () =>
  axios.get(`${API}/api/trade/portfolio`);

export const buyAsset = (data) =>
  axios.post(`${API}/api/trade/buy`, data);

export const sellAsset = (data) =>
  axios.post(`${API}/api/trade/sell`, data);

export const getAllPrices = () =>
  axios.get(`${API}/api/price/all`);
