import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://yourtube-backend-4g40.onrender.com", // ✅ Direct Render URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
