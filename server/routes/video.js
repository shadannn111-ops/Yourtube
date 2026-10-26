import express from "express";
import { getallvideo, uploadvideo, getChannelVideos, deleteVideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/channel/:channelId", getChannelVideos);
routes.delete("/delete/:videoId", deleteVideo); // ✅ Naya delete route

export default routes;
