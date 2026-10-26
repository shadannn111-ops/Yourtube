import express from "express";
import {
  postcomment,
  getallcomment,
  deletecomment,
  editcomment,
  likeComment,
  dislikeComment,
  replyComment,
  reportComment,
  translateComment,
  getReplies,
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.post("/like/:commentId", likeComment);
routes.post("/dislike/:commentId", dislikeComment);
routes.post("/reply/:commentId", replyComment);
routes.post("/report/:commentId", reportComment);
routes.post("/translate", translateComment);
routes.get("/replies/:commentId", getReplies);

export default routes;
