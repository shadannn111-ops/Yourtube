import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

// ✅ Subscribe / Unsubscribe
export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;

  if (!channelId || !subscriberId) return res.status(400).json({ message: "Missing IDs" });

  try {
    let finalChannelId = channelId;

    // 🔥 THE FIX: Agar "admin" aaya, toh admin@yourtube.com ki real ID nikalo
    if (channelId.toLowerCase() === "admin") {
      const adminUser = await users.findOne({ email: "admin@yourtube.com" });
      if (adminUser) {
        finalChannelId = adminUser._id.toString();
      }
    }

    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: finalChannelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false, message: "Unsubscribed" });
    } else {
      await Subscribe.create({ subscriber: subscriberId, channel: finalChannelId });
      return res.status(200).json({ subscribed: true, message: "Subscribed" });
    }
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// ✅ Get Subscribed Channels (Bulletproof)
export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    let uniqueChannels = new Map(); // Map use karenge taaki duplicates na aayein

    for (const sub of subscriptions) {
      let channelId = sub.channel;

      // Agar purana "admin" hai, toh use real ID banao
      if (channelId.toLowerCase() === "admin") {
        const adminUser = await users.findOne({ email: "admin@yourtube.com" });
        if (adminUser) channelId = adminUser._id.toString();
      }

      // Agar ID valid hai, toh user dhundo
      if (mongoose.Types.ObjectId.isValid(channelId)) {
        const foundUser = await users.findById(channelId).select("_id name channelname email image description");
        if (foundUser) {
          uniqueChannels.set(foundUser._id.toString(), {
            ...foundUser.toObject(),
            channelname: foundUser.channelname || foundUser.name || "YourTube Official"
          });
        }
      }
    }

    return res.status(200).json(Array.from(uniqueChannels.values()));
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const checkSubscription = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    let finalChannelId = channelId;
    if (channelId.toLowerCase() === "admin") {
      const adminUser = await users.findOne({ email: "admin@yourtube.com" });
      if (adminUser) finalChannelId = adminUser._id.toString();
    }
    const sub = await Subscribe.findOne({ subscriber: userId, channel: finalChannelId });
    return res.status(200).json({ isSubscribed: !!sub });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getSubscriberCount = async (req, res) => {
  const { channelId } = req.params;
  try {
    const count = await Subscribe.countDocuments({ channel: channelId });
    return res.status(200).json({ count });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};
