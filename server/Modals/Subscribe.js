import mongoose from "mongoose";

const subscribeSchema = mongoose.Schema(
  {
    subscriber: {
      type: String, // ✅ String kar diya
      required: true,
    },
    channel: {
      type: String, // ✅ String kar diya
      required: true,
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("subscribe", subscribeSchema);
