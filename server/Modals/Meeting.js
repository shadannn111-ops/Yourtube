import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  roomId: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ✅ Password add kiya
  host: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  maxParticipants: { type: Number, default: 10 },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ["active", "ended"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Meeting", meetingSchema);
