import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  videoId: { type: String, required: true },
  videoTitle: { type: String },
  thumbnail: { type: String },
  downloadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["completed", "failed", "interrupted"], default: "completed" },
  fileSize: { type: String },
  subscriptionPlanUsed: { type: String, default: "free" },
  ipAddress: { type: String },
  deviceInfo: { type: String },
  browser: { type: String },
}, { timestamps: true });

export default mongoose.model("Download", downloadSchema);
