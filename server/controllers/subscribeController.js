import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;

  if (!channelId || !subscriberId) return res.status(400).json({ message: "Missing IDs" });

  try {
    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false });
    } else {
      await Subscribe.create({ subscriber: subscriberId, channel: channelId });
      return res.status(200).json({ subscribed: true });
    }
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    let channels = [];
    
    // ✅ Admin User ID nikaalo (YourTube Official)
    const adminUser = await users.findOne({ email: "admin@yourtube.com" });

    for (const sub of subscriptions) {
      let channelId = sub.channel;

      // ✅ FIX: Agar purana "admin" string hai, toh usko adminUser ki ID se replace karo
      if (channelId === "admin" && adminUser) {
        channelId = adminUser._id.toString();
      }

      if (mongoose.Types.ObjectId.isValid(channelId)) {
        const user = await users.findById(channelId).select("_id name channelname email image description");
        if (user) {
          channels.push({ ...user.toObject(), channelname: user.channelname || user.name || "YourTube Official" });
        }
      }
    }

    // ✅ Duplicate channels hatao (agar koi ho)
    const uniqueChannels = channels.filter((v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i);

    return res.status(200).json(uniqueChannels);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const checkSubscription = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    const sub = await Subscribe.findOne({ subscriber: userId, channel: channelId });
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
