import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

// ✅ Subscribe / Unsubscribe
export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;

  if (!channelId || !subscriberId) {
    return res.status(400).json({ message: "Missing channelId or subscriberId" });
  }

  try {
    // Check karo pehle se subscribed hai ya nahi
    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false, message: "Unsubscribed" });
    } else {
      // Naya subscribe karo
      await Subscribe.create({ subscriber: subscriberId, channel: channelId });
      return res.status(200).json({ subscribed: true, message: "Subscribed" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get Subscribed Channels (THE FIX)
export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. User ki saari subscriptions nikalo
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    // 2. Channel IDs nikalo
    const channelIds = subscriptions.map((sub) => sub.channel);

    // 3. Sirf valid ObjectIds filter karo
    const validIds = channelIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) return res.status(200).json([]);

    // 4. Users fetch karo
    const channels = await users.find({ _id: { $in: validIds } }).select("_id name channelname email image description");

    // 5. Safe data return karo (agar channelname nahi hai toh name daal do)
    const safeChannels = channels.map((c) => ({
      ...c.toObject(),
      channelname: c.channelname || c.name || c.email?.split("@")[0] || "User",
    }));

    return res.status(200).json(safeChannels);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkSubscription = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    const sub = await Subscribe.findOne({ subscriber: userId, channel: channelId });
    return res.status(200).json({ isSubscribed: !!sub });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSubscriberCount = async (req, res) => {
  const { channelId } = req.params;
  try {
    const count = await Subscribe.countDocuments({ channel: channelId });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
