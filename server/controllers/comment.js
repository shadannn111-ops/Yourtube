import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import translate from "@vitalets/google-translate-api";

// ==================== PROFANITY FILTER ====================
const abusiveWords = ["badword1", "badword2", "stupid", "idiot", "hate", "dumb"];
const checkProfanity = (text) => {
  const lowerText = text.toLowerCase();
  return abusiveWords.some((word) => lowerText.includes(word));
};

// ==================== SPAM CHECK ====================
const checkSpam = (text) => {
  const specialChars = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  const emojis = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  if (specialChars > 20 || emojis > 10) return true;
  return false;
};

// ==================== MALICIOUS LINKS CHECK ====================
const checkMaliciousLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  const maliciousDomains = ["bit.ly", "tinyurl.com", "goo.gl", "malicious.com"];
  return urls.some((url) => maliciousDomains.some((domain) => url.includes(domain)));
};

// ==================== MENTIONS EXTRACTOR ====================
const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

// ==================== POST COMMENT ====================
export const postcomment = async (req, res) => {
  const commentdata = req.body;

  try {
    if (checkProfanity(commentdata.commentbody)) {
      return res.status(400).json({ message: "Comment contains abusive language" });
    }
    if (checkSpam(commentdata.commentbody)) {
      return res.status(400).json({ message: "Comment looks like spam" });
    }
    if (checkMaliciousLinks(commentdata.commentbody)) {
      return res.status(400).json({ message: "Comment contains malicious link" });
    }

    const mentions = extractMentions(commentdata.commentbody);

    const postcomment = new comment({
      ...commentdata,
      mentions,
      language: commentdata.language || "en",
    });

    await postcomment.save();
    return res.status(200).json({ comment: true, data: postcomment });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== GET ALL COMMENTS ====================
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  const { sort = "newest" } = req.query;

  try {
    let sortQuery = {};
    if (sort === "oldest") sortQuery = { commentedon: 1 };
    else if (sort === "mostliked") sortQuery = { likeCount: -1 };
    else if (sort === "relevant") sortQuery = { likeCount: -1, commentedon: -1 };
    else sortQuery = { commentedon: -1 };

    const comments = await comment
      .find({ videoid, parentComment: null, isDeleted: false })
      .sort(sortQuery)
      .populate({
        path: "replies",
        model: "comment",
        populate: { path: "userid", model: "user" },
      });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== GET REPLIES ====================
export const getReplies = async (req, res) => {
  const { commentId } = req.params;

  try {
    const replies = await comment
      .find({ parentComment: commentId, isDeleted: false })
      .sort({ commentedon: -1 });

    return res.status(200).json(replies);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== LIKE COMMENT ====================
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const commentData = await comment.findById(commentId);
    if (!commentData) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasLiked = commentData.likedBy?.includes(userId);

    if (hasLiked) {
      commentData.likeCount -= 1;
      commentData.likedBy = commentData.likedBy.filter((id) => id !== userId);
    } else {
      commentData.likeCount += 1;
      commentData.likedBy = [...(commentData.likedBy || []), userId];
    }

    await commentData.save();
    return res.status(200).json({ likeCount: commentData.likeCount });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== DISLIKE COMMENT ====================
export const dislikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const commentData = await comment.findById(commentId);
    if (!commentData) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasDisliked = commentData.dislikedBy?.includes(userId);

    if (hasDisliked) {
      commentData.dislikeCount -= 1;
      commentData.dislikedBy = commentData.dislikedBy.filter((id) => id !== userId);
    } else {
      commentData.dislikeCount += 1;
      commentData.dislikedBy = [...(commentData.dislikedBy || []), userId];
    }

    await commentData.save();
    return res.status(200).json({ dislikeCount: commentData.dislikeCount });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== REPLY TO COMMENT ====================
export const replyComment = async (req, res) => {
  const { commentId } = req.params;
  const { userid, videoid, commentbody, usercommented, userProfilePic, language } = req.body;

  try {
    if (checkProfanity(commentbody)) {
      return res.status(400).json({ message: "Comment contains abusive language" });
    }

    const reply = new comment({
      userid,
      videoid,
      commentbody,
      usercommented,
      userProfilePic,
      parentComment: commentId,
      language: language || "en",
    });

    await reply.save();

    await comment.findByIdAndUpdate(commentId, {
      $push: { replies: reply._id },
    });

    return res.status(200).json({ comment: true, data: reply });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== EDIT COMMENT ====================
export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    if (checkProfanity(commentbody)) {
      return res.status(400).json({ message: "Comment contains abusive language" });
    }

    const commentData = await comment.findById(_id);
    if (!commentData) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const timeDiff = Date.now() - new Date(commentData.commentedon).getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Cannot edit comment after 24 hours" });
    }

    const updatecomment = await comment.findByIdAndUpdate(
      _id,
      {
        $set: {
          commentbody,
          isEdited: true,
          editedAt: new Date(),
        },
      },
      { new: true }
    );
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== DELETE COMMENT ====================
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    const commentData = await comment.findById(_id);
    if (!commentData) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (commentData.userid.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteMany({ parentComment: _id });
    await comment.findByIdAndDelete(_id);

    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== REPORT COMMENT ====================
export const reportComment = async (req, res) => {
  const { commentId } = req.params;
  const { reason } = req.body;

  try {
    const commentData = await comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          isReported: true,
          reportReason: reason,
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Comment reported", comment: commentData });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==================== 🌐 TRANSLATE COMMENT (REAL) ====================
export const translateComment = async (req, res) => {
  const { text, targetLanguage = "en" } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    // ✅ Real Google Translate call
    const result = await translate.translate(text, { to: targetLanguage });

    // Detected source language
    const detectedLang =
      result.raw?.src || result.from?.language?.iso || "auto";

    // Agar source aur target same hain
    const alreadyInTargetLang =
      detectedLang.toLowerCase() === targetLanguage.toLowerCase();

    return res.status(200).json({
      success: true,
      originalText: text,
      translatedText: result.text,
      sourceLanguage: detectedLang,
      targetLanguage,
      alreadyInTargetLang,
    });
  } catch (error) {
    console.error("Translation error:", error.message);
    return res.status(200).json({
      success: false,
      originalText: text,
      translatedText: text,
      translationFailed: true,
      message: "Translation service unavailable. Please try again.",
    });
  }
};

// ==================== GET COMMENTS SORTED ====================
export const getCommentsSorted = async (req, res) => {
  const { videoid } = req.params;
  const { sort } = req.query;

  try {
    let sortQuery = {};
    if (sort === "oldest") sortQuery = { commentedon: 1 };
    else if (sort === "mostliked") sortQuery = { likeCount: -1 };
    else if (sort === "relevant") sortQuery = { likeCount: -1, commentedon: -1 };
    else sortQuery = { commentedon: -1 };

    const comments = await comment
      .find({ videoid, parentComment: null, isDeleted: false })
      .sort(sortQuery);

    return res.status(200).json(comments);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};