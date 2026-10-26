import express from "express";
import {
  handleSubscribe,
  getSubscribedChannels,
  checkSubscription,
  getSubscriberCount,
} from "../controllers/subscribeController.js";

const routes = express.Router();

routes.post("/:channelId", handleSubscribe);
routes.get("/channels/:userId", getSubscribedChannels);
routes.get("/check/:channelId/:userId", checkSubscription);
routes.get("/count/:channelId", getSubscriberCount); // ✅ Naya route

export default routes;
