import express from "express";
import { createMeeting, getUserMeetings, getMeeting, endMeeting } from "../controllers/meetingController.js";

const routes = express.Router();

routes.post("/create", createMeeting);
routes.get("/user/:userId", getUserMeetings);
routes.get("/:roomId", getMeeting);
routes.put("/end/:roomId", endMeeting);

export default routes;
