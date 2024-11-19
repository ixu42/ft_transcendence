// src/services/apiService.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Bakcend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  getPlayers() {
    return apiClient.get('/players');
  },

};
