import express from "express";
import { checkDownloadLimit, downloadVideo, getDownloadHistory, deleteDownload } from "../controllers/downloadController.js";

const routes = express.Router();

routes.get("/check-limit/:userId", checkDownloadLimit);
routes.post("/download", downloadVideo);
routes.get("/history/:userId", getDownloadHistory);
routes.delete("/delete/:downloadId", deleteDownload); // ✅ Naya route

export default routes;
