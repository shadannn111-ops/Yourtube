import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;

  if (!channelId || !subscriberId) {
    return res.status(400).json({ message: "Missing channelId or subscriberId" });
  }

  try {
    const existingSub = await Subscribe.findOne({ subscriber: subscriberId, channel: channelId });

    if (existingSub) {
      await Subscribe.findByIdAndDelete(existingSub._id);
      return res.status(200).json({ subscribed: false, message: "Unsubscribed" });
    } else {
      await Subscribe.create({ subscriber: subscriberId, channel: channelId });
      return res.status(200).json({ subscribed: true, message: "Subscribed" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    const channelValues = subscriptions.map((sub) => sub.channel);

    // ✅ Valid ObjectIds filter karo
    const validObjectIds = channelValues.filter((id) => mongoose.Types.ObjectId.isValid(id));
    
    let channels = [];

    // Agar valid ObjectIds hain toh users fetch karo
    if (validObjectIds.length > 0) {
      const idChannels = await users.find({ _id: { $in: validObjectIds } }).select("_id name channelname email image description");
      channels = [...channels, ...idChannels];
    }

    // ✅ Agar purane subscriptions "admin" naam se hain, toh unhe name se match karo
    const stringValues = channelValues.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (stringValues.length > 0) {
      const nameChannels = await users.find({ $or: [{ name: { $in: stringValues } }, { channelname: { $in: stringValues } }] }).select("_id name channelname email image description");
      channels = [...channels, ...nameChannels];
    }

    // ✅ Agar channelname nahi hai, toh name daal do fallback
    const safeChannels = channels.map((c) => ({ ...c.toObject(), channelname: c.channelname || c.name || c.email || "User" }));

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
