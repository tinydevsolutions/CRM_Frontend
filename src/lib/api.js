import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Assume backend port 5000
});

// Add a request interceptor to append the JWT
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("crm_user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token issue, maybe logout
      localStorage.removeItem("crm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
