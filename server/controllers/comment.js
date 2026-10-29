import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import translate from "@vitalets/google-translate-api";

const abusiveWords = ["badword1", "badword2", "stupid", "idiot", "hate", "dumb"];
const checkProfanity = (text) => abusiveWords.some((word) => text.toLowerCase().includes(word));

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  try {
    if (!commentdata.videoid || !commentdata.userid || !commentdata.commentbody) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (checkProfanity(commentdata.commentbody)) return res.status(400).json({ message: "Abusive language" });

    const postcomment = new comment({
      ...commentdata,
      parentComment: null,
      language: commentdata.language || "en",
    });

    await postcomment.save();
    return res.status(200).json({ comment: true, data: postcomment });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  const { sort = "newest" } = req.query;
  try {
    let sortQuery = {};
    if (sort === "oldest") sortQuery = { commentedon: 1 };
    else if (sort === "mostliked") sortQuery = { likeCount: -1 };
    else sortQuery = { commentedon: -1 };

    const comments = await comment.find({ 
      videoid, 
      $or: [{ parentComment: null }, { parentComment: { $exists: false } }],
      isDeleted: false 
    }).sort(sortQuery);
    return res.status(200).json(comments);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const getReplies = async (req, res) => {
  const { commentId } = req.params;
  try {
    const replies = await comment.find({ parentComment: commentId, isDeleted: false }).sort({ commentedon: -1 });
    return res.status(200).json(replies);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const commentData = await comment.findById(commentId);
    if (!commentData) return res.status(404).json({ message: "Comment not found" });

    if (commentData.likedBy?.includes(userId)) {
      commentData.likeCount -= 1;
      commentData.likedBy = commentData.likedBy.filter((id) => id !== userId);
    } else {
      commentData.likeCount += 1;
      commentData.likedBy = [...(commentData.likedBy || []), userId];
    }
    await commentData.save();
    return res.status(200).json({ likeCount: commentData.likeCount });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const dislikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const commentData = await comment.findById(commentId);
    if (!commentData) return res.status(404).json({ message: "Comment not found" });

    if (commentData.dislikedBy?.includes(userId)) {
      commentData.dislikeCount -= 1;
      commentData.dislikedBy = commentData.dislikedBy.filter((id) => id !== userId);
    } else {
      commentData.dislikeCount += 1;
      commentData.dislikedBy = [...(commentData.dislikedBy || []), userId];
    }
    await commentData.save();
    return res.status(200).json({ dislikeCount: commentData.dislikeCount });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const replyComment = async (req, res) => {
  const { commentId } = req.params;
  const { userid, videoid, commentbody, usercommented, userProfilePic, language } = req.body;
  try {
    const reply = new comment({
      userid, videoid, commentbody, usercommented, userProfilePic,
      parentComment: commentId, language: language || "en",
    });
    await reply.save();
    return res.status(200).json({ comment: true, data: reply });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("comment unavailable");
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, { $set: { commentbody, isEdited: true, editedAt: new Date() } }, { new: true });
    return res.status(200).json(updatecomment);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("comment unavailable");
  try {
    const commentData = await comment.findById(_id);
    if (!commentData) return res.status(404).json({ message: "Comment not found" });
    if (commentData.userid.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
    
    await comment.deleteMany({ parentComment: _id });
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const reportComment = async (req, res) => {
  const { commentId } = req.params;
  const { reason } = req.body;
  try {
    const commentData = await comment.findByIdAndUpdate(commentId, { $set: { isReported: true, reportReason: reason } }, { new: true });
    return res.status(200).json({ success: true, message: "Comment reported", comment: commentData });
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};

export const translateComment = async (req, res) => {
  const { text, targetLanguage = "en" } = req.body;
  if (!text || typeof text !== "string") return res.status(400).json({ message: "Text is required" });
  try {
    const result = await translate.translate(text, { to: targetLanguage });
    const detectedLang = result.raw?.src || result.from?.language?.iso || "auto";
    return res.status(200).json({ success: true, translatedText: result.text, sourceLanguage: detectedLang, targetLanguage });
  } catch (error) {
    return res.status(200).json({ success: false, translatedText: text, translationFailed: true });
  }
};

export const getCommentsSorted = async (req, res) => {
  const { videoid } = req.params;
  const { sort } = req.query;
  try {
    let sortQuery = {};
    if (sort === "oldest") sortQuery = { commentedon: 1 };
    else if (sort === "mostliked") sortQuery = { likeCount: -1 };
    else sortQuery = { commentedon: -1 };

    const comments = await comment.find({ videoid, parentComment: null, isDeleted: false }).sort(sortQuery);
    return res.status(200).json(comments);
  } catch (error) { return res.status(500).json({ message: "Something went wrong" }); }
};
