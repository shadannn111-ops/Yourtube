import express from "express";
import { login, register, updateprofile, deleteUser } from "../controllers/auth.js";
import { verifyOTP, updateTheme, getLoginHistory, resendOTP } from "../controllers/securityController.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/register", register);
routes.patch("/update/:id", updateprofile);
routes.delete("/delete/:id", deleteUser);
routes.post("/verify-otp", verifyOTP);
routes.put("/update-theme", updateTheme);
routes.get("/login-history/:userId", getLoginHistory);
routes.post("/resend-otp", resendOTP);

export default routes;
