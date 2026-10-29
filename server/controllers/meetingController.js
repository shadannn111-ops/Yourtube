import Meeting from "../Modals/Meeting.js";
import crypto from "crypto";

// ✅ Create Meeting
export const createMeeting = async (req, res) => {
  const { userId, title, maxParticipants, duration } = req.body;
  try {
    const roomId = crypto.randomBytes(4).toString("hex").toUpperCase(); // Random 8-char ID
    
    const meeting = await Meeting.create({
      title: title || "Video Call",
      roomId,
      host: userId,
      maxParticipants: maxParticipants || 10,
      duration: duration || 60,
    });

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    console.error("Create Meeting Error:", error);
    return res.status(500).json({ message: "Failed to create meeting" });
  }
};

// ✅ Get User's Meetings
export const getUserMeetings = async (req, res) => {
  const { userId } = req.params;
  try {
    const meetings = await Meeting.find({ host: userId }).sort({ createdAt: -1 }).populate("host", "name email");
    return res.status(200).json(meetings);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

// ✅ Get Single Meeting
export const getMeeting = async (req, res) => {
  const { roomId } = req.params;
  try {
    const meeting = await Meeting.findOne({ roomId }).populate("host", "name email");
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    return res.status(200).json(meeting);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch meeting" });
  }
};

// ✅ End Meeting
export const endMeeting = async (req, res) => {
  const { roomId } = req.params;
  try {
    const meeting = await Meeting.findOneAndUpdate({ roomId }, { status: "ended" }, { new: true });
    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    return res.status(500).json({ message: "Failed to end meeting" });
  }
};
