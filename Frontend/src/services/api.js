import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://job-portal-uhh4.onrender.com/api", // backend url
  // withCredentials: true // enable if backend uses cookies for auth
});

// Attach token dynamically for every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// handle 401 centrally: clear local storage and redirect to home

API.interceptors.response.use(res => res, (err) => {
  if(err.response?.status === 401)
  {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    //redirect to home
    window.location.href = '/';
  }
  return Promise.reject(err);
});
export default API;