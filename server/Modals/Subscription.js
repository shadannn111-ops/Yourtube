import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  paymentId: { type: String },
  orderId: { type: String },
  invoiceNumber: { type: String },
  status: { type: String, enum: ["active", "expired", "cancelled", "pending"], default: "active" },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  renewalInfo: { type: Object },
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
