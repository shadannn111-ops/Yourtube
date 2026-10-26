import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import video from "../Modals/video.js";
import comment from "../Modals/comment.js";
import Subscribe from "../Modals/Subscribe.js";
import like from "../Modals/like.js";
import watchlater from "../Modals/watchlater.js";
import history from "../Modals/history.js";

const hashPassword = (password) => crypto.createHash("sha256").update(password).digest("hex");
const verifyPassword = (password, hash) => hashPassword(password) === hash;

export const login = async (req, res) => {
  const { email, name, image, password } = req.body;
  try {
    if (!password) return res.status(400).json({ message: "Password required" });
    
    const hashedPassword = hashPassword(password);
    let existingUser = await users.findOne({ email });

    // ✅ Agar user database me nahi hai, toh direct error bhejo (Account mat banao)
    if (!existingUser) {
      return res.status(404).json({ 
        message: "User doesn't exist. Please create an account." 
      });
    }

    // Agar user exist karta hai, toh password verify karo
    if (!verifyPassword(password, existingUser.password)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Login Success
    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    return res.status(200).json({
      result: { ...existingUser.toObject(), subscriptionPlan: existingUser.subscriptionPlan || "free" },
      token,
    });
  } catch (error) { 
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" }); 
  }
};

// ✅ NAYA: Registration ke liye alag function (Agar tumhare paas pehle se hai toh isko ignore karo, par frontend se call karna hoga)
export const register = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    if (!email || !password || !name) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = hashPassword(password);
    const newUser = await users.create({
      email,
      name,
      password: hashedPassword,
      subscriptionPlan: "free",
    });

    return res.status(201).json({ message: "Account created successfully. Please login now." });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description, image, name } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(500).json({ message: "User unavailable..." });
  try {
    const updateFields = {};
    if (channelname !== undefined) updateFields.channelname = channelname;
    if (description !== undefined) updateFields.description = description;
    if (image !== undefined) updateFields.image = image;
    if (name !== undefined) updateFields.name = name;

    const updatedata = await users.findByIdAndUpdate(_id, { $set: updateFields }, { new: true });
    return res.status(201).json(updatedata);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const deleteUser = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ message: "Invalid user ID" });
  try {
    await video.deleteMany({ uploader: _id });
    await comment.deleteMany({ userid: _id });
    await Subscribe.deleteMany({ $or: [{ subscriber: _id }, { channel: _id }] });
    await like.deleteMany({ viewer: _id });
    await watchlater.deleteMany({ viewer: _id });
    await history.deleteMany({ viewer: _id });
    await users.findByIdAndDelete(_id);
    return res.status(200).json({ success: true, message: "Channel deleted successfully" });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};
