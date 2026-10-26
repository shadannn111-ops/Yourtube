import express from "express";
import {
  adminLogin,
  getAllUsers,
  getLoginHistory,
  getAllSubscriptions,
  adminUploadVideo,
  updateVideoDetails,
  deleteUser,
  getPaymentSettings,
  updatePaymentSettings,
} from "../controllers/adminController.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/login", adminLogin);
routes.get("/users", getAllUsers);
routes.get("/login-history", getLoginHistory);
routes.get("/subscriptions", getAllSubscriptions);
routes.post("/upload-video", upload.single("file"), adminUploadVideo);
routes.put("/update-video/:videoId", updateVideoDetails); // ✅ Naya Edit route
routes.delete("/delete-user/:userId", deleteUser);
routes.get("/payment-settings", getPaymentSettings);
routes.put("/payment-settings", updatePaymentSettings);

export default routes;
