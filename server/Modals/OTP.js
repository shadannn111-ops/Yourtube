import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ["login", "reset"], default: "login" },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("OTP", OTPSchema);