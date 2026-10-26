import express from "express";
import {
  getAllPlans,
  getUserSubscription,
  mockPayment,
  cancelSubscription,
  fakeUpiPayment,
} from "../controllers/subscriptionController.js";

const routes = express.Router();

routes.get("/plans", getAllPlans);
routes.get("/:userId", getUserSubscription);
routes.post("/mock-payment", mockPayment);
routes.post("/cancel/:userId", cancelSubscription);
routes.post("/fake-upi-payment", fakeUpiPayment);

export default routes;