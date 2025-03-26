import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
  timeout: 5000, // Tempo limite para requisições
});

export default api;
