import { useState, createContext, useEffect, useContext } from "react";
import axios from "axios";

const UserContext = createContext();
const API_URL = "https://yourtube-backend-4g40.onrender.com"; // ✅ Direct URL

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Loading state

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
    document.documentElement.setAttribute("data-theme", "light");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("theme");
  };

  const verifyOTP = async (otp) => {
    try {
      const email = localStorage.getItem("pendingEmail");
      const response = await axios.post(`${API_URL}/user/verify-otp`, { email, otp });
      if (response.data.user) {
        login(response.data.user);
        setOtpRequired(false);
        setPendingUser(null);
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingToken");
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "OTP verification failed" };
    }
  };

  const resendOTP = async () => {
    try {
      const email = localStorage.getItem("pendingEmail");
      await axios.post(`${API_URL}/user/resend-otp`, { email });
      return { success: true };
    } catch (error) { return { success: false }; }
  };

  const updateTheme = async (theme) => {
    try {
      if (user) {
        await axios.put(`${API_URL}/user/update-theme`, { userId: user._id, theme });
        setUser({ ...user, theme });
        localStorage.setItem("theme", theme);
      }
    } catch (error) { console.error(error); }
  };

  // ✅ SAFE USER LOAD
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <UserContext.Provider value={{ user, login, logout, verifyOTP, resendOTP, updateTheme, otpRequired, pendingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
