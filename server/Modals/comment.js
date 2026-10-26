import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  videoid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "videofiles",
    required: true,
  },
  commentbody: { type: String },
  usercommented: { type: String },
  userProfilePic: { type: String },
  userLocation: { type: String },
  commentedon: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "comment", default: null },
  mentions: [{ type: String }],
  language: { type: String, default: "en" },
  isReported: { type: Boolean, default: false },
  reportReason: { type: String },
  isFlagged: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("comment", commentSchema);
