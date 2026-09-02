import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/plans", SubscriptionController.getPlans);
router.get("/me", authenticate, SubscriptionController.getMySubscription);
router.post("/subscribe", authenticate, SubscriptionController.subscribe);
router.post("/cancel", authenticate, SubscriptionController.cancelSubscription);

export default router;
