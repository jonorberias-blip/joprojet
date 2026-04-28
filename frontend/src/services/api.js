import axios from 'axios';

const API = axios.create({
  baseURL:"https://joprojet.onrender.com"
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion simple des erreurs
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // On ne redirige pas si on est déjà sur la page de login ou si c'est une tentative de login
      if (!window.location.pathname.includes('/login') && !error.config.url.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
