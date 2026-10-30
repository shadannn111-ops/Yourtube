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

    // Agar "admin" hai, toh real admin ID uthao
    if (channelId === "admin" || channelId === "yourTube Official") {
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

// ✅ Get Subscribed Channels (Bulletproof)
export const getSubscribedChannels = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. User ki saari subscriptions nikalo
    const subscriptions = await Subscribe.find({ subscriber: userId });
    if (subscriptions.length === 0) return res.status(200).json([]);

    let foundChannels = [];

    // 2. Har ek subscription pe loop chalao (taaki ek galat ID se sab na ruke)
    for (const sub of subscriptions) {
      let channelId = sub.channel;

      // Agar purana "admin" string hai, toh use real ID banao
      if (channelId === "admin" || channelId === "yourTube Official") {
        const adminUser = await users.findOne({ email: "admin@yourtube.com" });
        if (adminUser) channelId = adminUser._id.toString();
      }

      // Agar ID valid hai, toh user fetch karo
      if (mongoose.Types.ObjectId.isValid(channelId)) {
        const foundUser = await users.findById(channelId).select("_id name channelname email image description");
        if (foundUser) {
          foundChannels.push({
            ...foundUser.toObject(),
            channelname: foundUser.channelname || foundUser.name || "YourTube Official"
          });
        }
      } 
      // Agar ID nahi hai (String hai), toh naam se dhundho
      else {
        const foundByName = await users.findOne({ 
          $or: [{ name: channelId }, { channelname: channelId }] 
        }).select("_id name channelname email image description");
        
        if (foundByName) {
          foundChannels.push({
            ...foundByName.toObject(),
            channelname: foundByName.channelname || foundByName.name || "YourTube Official"
          });
        }
      }
    }

    // 3. Duplicate channels hatao
    const uniqueChannels = foundChannels.filter((v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i);

    return res.status(200).json(uniqueChannels);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

export const checkSubscription = async (req, res) => {
  const { channelId, userId } = req.params;
  try {
    let finalChannelId = channelId;
    if (channelId === "admin" || channelId === "yourTube Official") {
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
