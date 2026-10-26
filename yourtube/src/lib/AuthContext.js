import { useState, createContext, useEffect, useContext } from "react";
import axios from "axios";

const UserContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
    // ✅ Default theme light kardo
    const currentTheme = userdata.theme || "light";
    localStorage.setItem("theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
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
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    
    // ✅ Check karo theme saved hai ya nahi, nahi toh Light set karo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, verifyOTP, resendOTP, updateTheme, otpRequired, pendingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
