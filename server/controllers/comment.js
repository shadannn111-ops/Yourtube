import comment from "../Modals/comment.js";
import mongoose from "mongoose";

export const postcomment = async (req, res) => {
  const { videoid, userid, commentbody, usercommented, userProfilePic } = req.body;

  // ✅ Check karo ki saari fields aa rahi hain
  if (!videoid || !userid || !commentbody) {
    return res.status(400).json({ message: "Missing required fields (video, user, or text)" });
  }

  try {
    const postcomment = new comment({
      videoid,
      userid,
      commentbody,
      usercommented: usercommented || "Anonymous",
      userProfilePic: userProfilePic || "",
    });

    await postcomment.save();
    return res.status(200).json({ comment: true, data: postcomment });
  } catch (error) {
    console.error("Post Comment Error:", error);
    return res.status(500).json({ message: "Failed to save comment" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  const { sort = "newest" } = req.query;

  try {
    let sortQuery = {};
    if (sort === "oldest") sortQuery = { commentedon: 1 };
    else if (sort === "mostliked") sortQuery = { likeCount: -1 };
    else sortQuery = { commentedon: -1 };

    const comments = await comment.find({ videoid, parentComment: null, isDeleted: false }).sort(sortQuery);
    return res.status(200).json(comments);
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
