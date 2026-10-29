import express from "express";
import { createMeeting, joinMeeting, getUserMeetings, endMeeting } from "../controllers/meetingController.js";

const routes = express.Router();

routes.post("/create", createMeeting);
routes.post("/join", joinMeeting); // ✅ Naya join route
routes.get("/user/:userId", getUserMeetings);
routes.put("/end/:roomId", endMeeting);

export default routes;
