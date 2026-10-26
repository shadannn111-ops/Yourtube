import Admin from "../Modals/Admin.js";
import users from "../Modals/Auth.js";
import LoginHistory from "../Modals/LoginHistory.js";
import Subscription from "../Modals/Subscription.js";
import video from "../Modals/video.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import PaymentSettings from "../Modals/PaymentSettings.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    if (admin.password !== hashedPassword) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ adminId: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({ admin, token });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@yourtube.com" });
    if (!adminExists) {
      const hashedPassword = crypto.createHash("sha256").update("admin123").digest("hex");
      await Admin.create({ email: "admin@yourtube.com", password: hashedPassword, name: "Admin" });
      console.log("Default admin created: admin@yourtube.com / admin123");
    }
  } catch (error) { console.error(error); }
};

export const getAllUsers = async (req, res) => {
  try { const usersList = await users.find().sort({ joinedon: -1 }); return res.status(200).json(usersList); }
  catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getLoginHistory = async (req, res) => {
  try {
    const loginHistory = await LoginHistory.find().sort({ loginTimestamp: -1 }).limit(100).populate("userId", "email name image");
    return res.status(200).json(loginHistory);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 }).populate("userId", "email name");
    return res.status(200).json(subscriptions);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

// ✅ SABSE BADI FIX: Video ab save hogi
export const adminUploadVideo = async (req, res) => {
  if (!req.file) return res.status(404).json({ message: "Please upload a video file" });
  try {
    let adminUser = await users.findOne({ email: "admin@yourtube.com" });
    if (!adminUser) {
      adminUser = await users.create({ email: "admin@yourtube.com", name: "YourTube Official", channelname: "YourTube Official", description: "Official YourTube channel", subscriptionPlan: "gold" });
    }
    
    // ✅ Cloudinary URL yahan se aayega
    const fileUrl = req.file.path || req.file.secure_url;
    
    const file = new video({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: fileUrl, // ✅ Cloudinary URL save hoga
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel || "YourTube Official",
      uploader: adminUser._id.toString(),
      thumbnail: req.body.thumbnail || "",
      category: req.body.category || "All",
    });
    await file.save(); // ✅ Yahan save ho raha hai
    return res.status(201).json("Video uploaded successfully");
  } catch (error) { console.error("UPLOAD ERROR:", error); return res.status(500).json({ message: "Something went wrong" }); }
};

export const updateVideoDetails = async (req, res) => {
  const { videoId } = req.params;
  const { videotitle, category } = req.body;
  try {
    const updatedVideo = await video.findByIdAndUpdate(videoId, { $set: { videotitle, category } }, { new: true });
    if (!updatedVideo) return res.status(404).json({ message: "Video not found" });
    return res.status(200).json({ success: true, video: updatedVideo });
  } catch (error) { return res.status(500).json({ message: "Failed to update video" }); }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try { await users.findByIdAndDelete(userId); return res.status(200).json({ message: "User deleted" }); }
  catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getPaymentSettings = async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) settings = await PaymentSettings.create({});
    return res.status(200).json(settings);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const updatePaymentSettings = async (req, res) => {
  const { upiId, phoneNumber, payeeName, qrCodeUrl, isFakePayment, warningMessage } = req.body;
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) settings = new PaymentSettings({});
    if (upiId !== undefined) settings.upiId = upiId;
    if (phoneNumber !== undefined) settings.phoneNumber = phoneNumber;
    if (payeeName !== undefined) settings.payeeName = payeeName;
    if (qrCodeUrl !== undefined) settings.qrCodeUrl = qrCodeUrl;
    if (isFakePayment !== undefined) settings.isFakePayment = isFakePayment;
    if (warningMessage !== undefined) settings.warningMessage = warningMessage;
    settings.updatedAt = new Date();
    await settings.save();
    return res.status(200).json({ success: true, settings });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};
