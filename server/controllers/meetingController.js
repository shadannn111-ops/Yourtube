import Meeting from "../Modals/Meeting.js";
import crypto from "crypto";

// ✅ Create Meeting with Password
export const createMeeting = async (req, res) => {
  const { userId, title, password, maxParticipants, duration } = req.body;
  try {
    if (!password) return res.status(400).json({ message: "Password required" });

    const roomId = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 char ID
    
    const meeting = await Meeting.create({
      title: title || "Video Call",
      roomId,
      password,
      host: userId,
      maxParticipants: maxParticipants || 10,
      duration: duration || 60,
    });

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create meeting" });
  }
};

// ✅ Join Meeting (Password Verify)
export const joinMeeting = async (req, res) => {
  const { roomId, password } = req.body;
  try {
    const meeting = await Meeting.findOne({ roomId, status: "active" });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (meeting.password !== password) return res.status(401).json({ message: "Invalid password" });

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    return res.status(500).json({ message: "Failed to join meeting" });
  }
};

export const getUserMeetings = async (req, res) => {
  const { userId } = req.params;
  try {
    const meetings = await Meeting.find({ host: userId }).sort({ createdAt: -1 }).populate("host", "name email");
    return res.status(200).json(meetings);
  } catch (error) { return res.status(500).json({ message: "Failed" }); }
};

export const endMeeting = async (req, res) => {
  const { roomId } = req.params;
  try {
    await Meeting.findOneAndUpdate({ roomId }, { status: "ended" });
    return res.status(200).json({ success: true });
  } catch (error) { return res.status(500).json({ message: "Failed" }); }
};
