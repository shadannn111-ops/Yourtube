import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    upiId: { type: String, default: "demo@upi" },
    phoneNumber: { type: String, default: "+91 9999999999" },
    payeeName: { type: String, default: "YourTube Admin" },
    qrCodeUrl: { type: String, default: "" },
    isFakePayment: { type: Boolean, default: true },
    warningMessage: {
      type: String,
      default:
        "⚠️ This is a FAKE payment for demo purposes. Real UPI payments will be enabled soon. Your subscription will be activated but no actual money will be transferred.",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);