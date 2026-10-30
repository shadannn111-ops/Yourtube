import Subscribe from "../Modals/Subscribe.js";
import users from "../Modals/Auth.js";
import mongoose from "mongoose";

export const handleSubscribe = async (req, res) => {
  const { channelId } = req.params;
  const { subscriberId } = req.body;
  if (!channelId || !subscriberId) return res.status(400).json({ message: "Missing IDs" });

  try {
    let finalChannelId = channelId;
    if (channelId.toLowerCase() === "admin") {
      const adminUser = await users.findOne({ email: "admin@yourtube.com" });
      if (adminUser) finalChannelId = adminUser._id.toString();
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

export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    let channels = [];
    const adminUser = await users.findOne({ email: "admin@yourtube.com" });
    
    // ✅ FIX: Admin hamesha list me top pe rahega
    if (adminUser) {
      channels.push({
        _id: adminUser._id,
        name: adminUser.name || "YourTube Official",
        channelname: adminUser.channelname || adminUser.name || "YourTube Official",
        image: adminUser.image || "",
        email: adminUser.email,
        description: adminUser.description || "Official YourTube Channel"
      });
    }

    const subscriptions = await Subscribe.find({ subscriber: userId });
    
    for (const sub of subscriptions) {
      let channelId = sub.channel;
      if (channelId.toLowerCase() === "admin") {
        if (adminUser) channelId = adminUser._id.toString();
      }

      if (mongoose.Types.ObjectId.isValid(channelId)) {
        const foundUser = await users.findById(channelId).select("_id name channelname email image description");
        if (foundUser && foundUser._id.toString() !== adminUser?._id.toString()) {
          channels.push({
            ...foundUser.toObject(),
            channelname: foundUser.channelname || foundUser.name || "User"
          });
        }
      }
    }

    // Duplicates hatao
    const uniqueChannels = channels.filter((v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i);
    return res.status(200).json(uniqueChannels);
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
