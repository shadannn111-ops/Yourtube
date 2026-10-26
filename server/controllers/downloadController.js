import Download from "../Modals/Download.js";
import Subscription from "../Modals/Subscription.js";
import users from "../Modals/Auth.js";

const downloadLimits = {
  free: { daily: 1, monthly: 10 },
  bronze: { daily: 3, monthly: 30 },
  silver: { daily: 10, monthly: 100 },
  gold: { daily: 999, monthly: 9999 },
};

const getUserPlan = async (userId) => {
  const user = await users.findById(userId);
  return user?.subscriptionPlan || "free";
};

const getDailyDownloadCount = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return await Download.countDocuments({ userId, downloadDate: { $gte: today }, status: "completed" });
};

const getMonthlyDownloadCount = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return await Download.countDocuments({ userId, downloadDate: { $gte: startOfMonth }, status: "completed" });
};

export const checkDownloadLimit = async (req, res) => {
  const { userId } = req.params;
  try {
    const plan = await getUserPlan(userId);
    const limits = downloadLimits[plan] || downloadLimits.free;
    const dailyCount = await getDailyDownloadCount(userId);
    const monthlyCount = await getMonthlyDownloadCount(userId);
    const dailyRemaining = Math.max(0, limits.daily - dailyCount);
    const monthlyRemaining = Math.max(0, limits.monthly - monthlyCount);
    return res.status(200).json({ plan, limits, dailyCount, monthlyCount, dailyRemaining, monthlyRemaining, canDownload: dailyRemaining > 0 && monthlyRemaining > 0 });
  } catch (error) { return res.status(500).json({ message: "Failed to check download limit" }); }
};

export const downloadVideo = async (req, res) => {
  const { userId, videoId, videoTitle, thumbnail } = req.body;
  try {
    const plan = await getUserPlan(userId);
    const limits = downloadLimits[plan] || downloadLimits.free;
    const dailyCount = await getDailyDownloadCount(userId);
    if (dailyCount >= limits.daily) return res.status(403).json({ message: "Daily download limit reached" });
    const monthlyCount = await getMonthlyDownloadCount(userId);
    if (monthlyCount >= limits.monthly) return res.status(403).json({ message: "Monthly download limit reached" });
    const existingDownload = await Download.findOne({ userId, videoId, downloadDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    if (existingDownload) return res.status(400).json({ message: "Video already downloaded today" });
    
    const download = await Download.create({ userId, videoId, videoTitle, thumbnail, status: "completed", subscriptionPlanUsed: plan, ipAddress: req.ip, deviceInfo: req.headers["user-agent"], browser: req.headers["user-agent"] });
    return res.status(200).json({ success: true, message: "Video downloaded successfully", download });
  } catch (error) { return res.status(500).json({ message: "Failed to download video" }); }
};

export const getDownloadHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const downloads = await Download.find({ userId }).sort({ downloadDate: -1 }).limit(50);
    return res.status(200).json(downloads);
  } catch (error) { return res.status(500).json({ message: "Failed to get download history" }); }
};

// ✅ NAYA: Download History Delete Karne Ka Function
export const deleteDownload = async (req, res) => {
  const { downloadId } = req.params;
  try {
    await Download.findByIdAndDelete(downloadId);
    return res.status(200).json({ success: true, message: "Download deleted successfully" });
  } catch (error) { return res.status(500).json({ message: "Failed to delete download" }); }
};

export const resetDailyCount = async () => { console.log("Daily download counts reset"); };
