import video from "../Modals/video.js";
import history from "../Modals/history.js";

export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    await history.findOneAndUpdate(
      { viewer: userId, videoid: videoId },
      { $set: { createdAt: new Date() } },
      { upsert: true, new: true }
    );
    await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    return res.status(200).json({ history: true });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const handleview = async (req, res) => {
  const { videoId } = req.params;
  try { await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }); return res.status(200).json({ success: true }); } 
  catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getallhistoryVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const historyvideo = await history.find({ viewer: userId }).sort({ createdAt: -1 }).populate({ path: "videoid", model: "videofiles" }).exec();
    return res.status(200).json(historyvideo);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

// ✅ NAYA: History Delete Function
export const deleteHistory = async (req, res) => {
  const { historyId } = req.params;
  try {
    await history.findByIdAndDelete(historyId);
    return res.status(200).json({ success: true, message: "History deleted" });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};
