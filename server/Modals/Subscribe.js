import mongoose from "mongoose";

const subscribeSchema = mongoose.Schema(
  {
    subscriber: { type: String, required: true },
    channel: { type: String, required: true }, // ✅ String hi rakho
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("subscribe", subscribeSchema);
