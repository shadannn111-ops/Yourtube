import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import LoginHistory from "../Modals/LoginHistory.js";
import OTP from "../Modals/OTP.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Helper: Get Client IP
const getClientIP = (req) => {
  return req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
};

// Helper: Detect Browser
const getBrowser = (req) => {
  const ua = req.headers["user-agent"] || "";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown";
};

// Helper: Detect OS
const getOS = (req) => {
  const ua = req.headers["user-agent"] || "";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS")) return "iOS";
  return "Unknown";
};

// Helper: Detect Device Type
const getDeviceType = (req) => {
  const ua = req.headers["user-agent"] || "";
  if (ua.includes("Mobile")) return "Mobile";
  if (ua.includes("Tablet")) return "Tablet";
  return "Desktop";
};

// ==================== LOGIN API (Updated) ====================
export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    // Find user
    let existingUser = await users.findOne({ email });

    if (!existingUser) {
      // Create new user
      existingUser = await users.create({ email, name, image });
      existingUser.theme = "dark"; // default theme
      await existingUser.save();
    }

    // Detect client details
    const ipAddress = getClientIP(req);
    const browser = getBrowser(req);
    const os = getOS(req);
    const deviceType = getDeviceType(req);

    // Check if this device/browser/IP is trusted
    const isTrusted = existingUser.trustedDevices?.some(
      (device) =>
        device.ipAddress === ipAddress &&
        device.browser === browser &&
        device.deviceType === deviceType
    );

    // Auto theme based on time (5AM - 12PM = Light, else Dark)
    const currentHour = new Date().getHours();
    let autoTheme = "dark";
    if (currentHour >= 5 && currentHour < 12) {
      autoTheme = "light";
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Agar naya device hai, OTP generate karo
    let otpRequired = false;
    if (!isTrusted) {
      otpRequired = true;

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Store OTP in DB
      await OTP.create({
        userId: existingUser._id,
        otp,
        purpose: "login",
        expiresAt,
      });

      // Log OTP (testing ke liye, baad mein email se replace karna)
      console.log(`OTP for ${existingUser.email}: ${otp}`);

      // Save login history (unverified)
      await LoginHistory.create({
        userId: existingUser._id,
        ipAddress,
        browser,
        os,
        deviceType,
        isTrustedDevice: false,
        otpVerified: false,
      });

      return res.json({
        message: "OTP sent to your email. Please verify.",
        token,
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          theme: autoTheme,
        },
        otpRequired,
      });
    }

    // Trusted device - direct login
    await LoginHistory.create({
      userId: existingUser._id,
      ipAddress,
      browser,
      os,
      deviceType,
      isTrustedDevice: true,
      otpVerified: true,
    });

    // Update theme if auto theme is different
    if (existingUser.theme !== autoTheme) {
      existingUser.theme = autoTheme;
      await existingUser.save();
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        theme: existingUser.theme,
      },
      otpRequired: false,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== VERIFY OTP API ====================
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Find OTP in DB
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp,
      purpose: "login",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Mark device as trusted
    const ipAddress = getClientIP(req);
    const browser = getBrowser(req);
    const os = getOS(req);
    const deviceType = getDeviceType(req);

    if (!user.trustedDevices) {
      user.trustedDevices = [];
    }
    user.trustedDevices.push({
      ipAddress,
      browser,
      os,
      deviceType,
      trustedAt: new Date(),
    });

    await user.save();

    // Update login history
    await LoginHistory.findOneAndUpdate(
      { userId: user._id, ipAddress, browser, otpVerified: false },
      { otpVerified: true, isTrustedDevice: true }
    );

    // Generate fresh JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "OTP verified successfully! Login complete.",
      token,
      user: {
        _id: user._id,
        email: user.email,
      },
      otpRequired: false,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== UPDATE THEME API ====================
export const updateTheme = async (req, res) => {
  const { userId, theme } = req.body;

  try {
    const user = await users.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: "User not found" });

    return res.json({ message: "Theme updated successfully", user });
  } catch (error) {
    console.error("Theme update error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== GET LOGIN HISTORY API ====================
export const getLoginHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const loginHistory = await LoginHistory.find({ userId })
      .sort({ loginTimestamp: -1 })
      .limit(20);

    return res.json(loginHistory);
  } catch (error) {
    console.error("Login history error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== RESEND OTP API ====================
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Delete old OTPs for this user
    await OTP.deleteMany({ userId: user._id, purpose: "login", isUsed: false });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      userId: user._id,
      otp,
      purpose: "login",
      expiresAt,
    });

    console.log(`Resent OTP for ${user.email}: ${otp}`);

    return res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};