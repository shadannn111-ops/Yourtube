import axios from "axios";

const axiosInstance = axios.create({
  // ✅ Hardcoded Render URL (taaki Vercel pe kabhi fail na ho)
  baseURL: "https://yourtube-backend-4g40.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
