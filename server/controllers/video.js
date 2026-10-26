import video from "../Modals/video.js";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res.status(404).json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: req.file.path,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// ✅ UPDATED: Ab ye bina kisi filter ke saari videos fetch karega
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find().sort({ createdAt: -1 }); // Latest videos pehle
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getChannelVideos = async (req, res) => {
  const { channelId } = req.params;
  try {
    const videos = await video.find({ uploader: channelId }).sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteVideo = async (req, res) => {
  const { videoId } = req.params;
  try {
    const deleted = await video.findByIdAndDelete(videoId);
    if (!deleted) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
