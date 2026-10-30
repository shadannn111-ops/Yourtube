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

    // ✅ FIX: Agar channelId "admin" hai, toh real Admin ID nikaalo
    if (channelId === "admin") {
      const adminUser = await users.findOne({ email: "admin@yourtube.com" });
      if (adminUser) {
        finalChannelId = adminUser._id.toString();
      }
    }

    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: finalChannelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false });
    } else {
      await Subscribe.create({ subscriber: subscriberId, channel: finalChannelId });
      return res.status(200).json({ subscribed: true });
    }
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// ✅ Get Subscribed Channels
export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    const channelValues = subscriptions.map((sub) => sub.channel);
    const validIds = channelValues.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const nameValues = channelValues.filter((id) => !mongoose.Types.ObjectId.isValid(id));

    let channels = [];

    if (validIds.length > 0) {
      const idChannels = await users.find({ _id: { $in: validIds } }).select("_id name channelname email image description");
      channels = [...channels, ...idChannels];
    }

    if (nameValues.length > 0) {
      const nameChannels = await users.find({ $or: [{ name: { $in: nameValues } }, { channelname: { $in: nameValues } }] }).select("_id name channelname email image description");
      channels = [...channels, ...nameChannels];
    }

    const safeChannels = channels.map((c) => ({ ...c.toObject(), channelname: c.channelname || c.name || "User" }));
    return res.status(200).json(safeChannels);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const checkSubscription = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    let finalChannelId = channelId;
    if (channelId === "admin") {
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
