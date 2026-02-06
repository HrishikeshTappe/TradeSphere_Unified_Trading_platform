import axios from "axios";

const API = "https://localhost:7283";

export const getPortfolio = () =>
  axios.get(`${API}/api/trade/portfolio`);

export const getPrice = (symbol) =>
  axios.get(`${API}/api/price?symbol=${symbol}`);

export const buyAsset = (symbol, amount) =>
  axios.post(`${API}/api/trade/buy?symbol=${symbol}&amount=${amount}`);

export const sellAsset = (symbol, qty) =>
  axios.post(`${API}/api/trade/sell?symbol=${symbol}&qty=${qty}`);
