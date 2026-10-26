import mongoose from "mongoose";

const LoginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String, required: true },
    browser: { type: String, required: true }, // e.g., Chrome, Firefox
    os: { type: String, required: true }, // Windows, macOS
    deviceType: { type: String, enum: ["Desktop", "Mobile", "Tablet"], default: "Desktop" },
    deviceModel: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    loginTimestamp: { type: Date, default: Date.now },
    isTrustedDevice: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("LoginHistory", LoginHistorySchema);