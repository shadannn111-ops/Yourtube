import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "../Modals/Subscription.js";
import users from "../Modals/Auth.js";

// Plans data
const plans = {
  free: { name: "Free", price: 0, duration: "lifetime", features: ["1 download/day", "480p quality", "Limited access"] },
  bronze: { name: "Bronze", price: 99, duration: "monthly", features: ["3 downloads/day", "720p quality", "Ad-free"] },
  silver: { name: "Silver", price: 199, duration: "monthly", features: ["10 downloads/day", "1080p quality", "Priority support", "Exclusive content"] },
  gold: { name: "Gold", price: 499, duration: "monthly", features: ["Unlimited downloads", "4K quality", "Early access", "Offline downloads", "Premium support"] },
};

// Get all plans
export const getAllPlans = async (req, res) => {
  try {
    return res.status(200).json(Object.values(plans));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch plans" });
  }
};

// Get user's current subscription
export const getUserSubscription = async (req, res) => {
  const { userId } = req.params;
  try {
    const subscription = await Subscription.findOne({ userId, status: "active" })
      .sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.status(200).json({ plan: "free", status: "free" });
    }
    
    return res.status(200).json(subscription);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get subscription" });
  }
};

// Mock Payment - Direct subscription activate karo
export const mockPayment = async (req, res) => {
  const { userId, plan } = req.body;
  try {
    if (!plans[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }
    
    const planDetails = plans[plan];
    const expiryDate = new Date();
    if (planDetails.duration === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planDetails.duration === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    // Update existing subscription or create new
    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: "active" },
      {
        plan,
        amount: planDetails.price,
        paymentId: "mock_payment_" + Date.now(),
        orderId: "mock_order_" + Date.now(),
        status: "active",
        startDate: new Date(),
        expiryDate,
      },
      { new: true, upsert: true }
    );
    
    // Update user's subscription plan
    await users.findByIdAndUpdate(userId, { subscriptionPlan: plan });
    
    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to activate subscription" });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  const { userId } = req.params;
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: "active" },
      { status: "cancelled" },
      { new: true }
    );
    
    // Downgrade to free
    await users.findByIdAndUpdate(userId, { subscriptionPlan: "free" });
    
    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to cancel subscription" });
  }
};

// Auto-downgrade expired subscriptions
export const checkAndDowngradeExpired = async () => {
  try {
    const expiredSubs = await Subscription.find({
      status: "active",
      expiryDate: { $lt: new Date() },
    });
    
    for (const sub of expiredSubs) {
      sub.status = "expired";
      await sub.save();
      await users.findByIdAndUpdate(sub.userId, { subscriptionPlan: "free" });
    }
    
    console.log(`Downgraded ${expiredSubs.length} expired subscriptions`);
  } catch (error) {
    console.error(error);
  }
};
// ==================== FAKE UPI PAYMENT CONFIRM ====================
export const fakeUpiPayment = async (req, res) => {
  const { userId, plan, transactionId, upiId } = req.body;

  try {
    if (!plans[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const planDetails = plans[plan];
    const expiryDate = new Date();
    if (planDetails.duration === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planDetails.duration === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    // Purana active subscription cancel karo
    await Subscription.updateMany(
      { userId, status: "active" },
      { status: "cancelled" }
    );

    // Naya subscription create karo
    const subscription = await Subscription.create({
      userId,
      plan,
      amount: planDetails.price,
      currency: "INR",
      paymentId: transactionId || `fake_upi_${Date.now()}`,
      orderId: `fake_order_${Date.now()}`,
      status: "active",
      startDate: new Date(),
      expiryDate,
      renewalInfo: {
        method: "UPI (FAKE)",
        upiId: upiId || "unknown",
        isFakePayment: true,
      },
    });

    // User ka plan update karo
    await users.findByIdAndUpdate(userId, { subscriptionPlan: plan });

    return res.status(200).json({
      success: true,
      subscription,
      message: `Subscribed to ${plan.toUpperCase()} plan (FAKE payment)`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to activate subscription" });
  }
};
