import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

// ✅ Subscribe / Unsubscribe
export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;

  if (!channelId || !subscriberId) return res.status(400).json({ message: "Missing IDs" });

  try {
    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false, message: "Unsubscribed" });
    } else {
      await Subscribe.create({ subscriber: subscriberId, channel: channelId });
      return res.status(200).json({ subscribed: true, message: "Subscribed" });
    }
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// ✅ Get Subscribed Channels (THE FIX)
export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    const channelValues = subscriptions.map((sub) => sub.channel);

    // ✅ Valid ObjectIds filter
    const validIds = channelValues.filter((id) => mongoose.Types.ObjectId.isValid(id));
    // ✅ Purane "admin" naam wale filter
    const nameValues = channelValues.filter((id) => !mongoose.Types.ObjectId.isValid(id));

    let channels = [];

    // Agar valid ObjectIds hain toh fetch karo
    if (validIds.length > 0) {
      const idChannels = await users.find({ _id: { $in: validIds } }).select("_id name channelname email image description");
      channels = [...channels, ...idChannels];
    }

    // Agar "admin" jaisa naam hai toh usse match karo
    if (nameValues.length > 0) {
      const nameChannels = await users.find({ 
        $or: [
          { name: { $in: nameValues } }, 
          { channelname: { $in: nameValues } },
          { email: "admin@yourtube.com" } // fallback
        ] 
      }).select("_id name channelname email image description");
      channels = [...channels, ...nameChannels];
    }

    // Safe data return
    const safeChannels = channels.map((c) => ({ 
      ...c.toObject(), 
      channelname: c.channelname || c.name || "User" 
    }));

    return res.status(200).json(safeChannels);
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
