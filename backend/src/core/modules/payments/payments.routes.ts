import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/stripe/checkout-session",
  authenticate,
  PaymentsController.createStripeCheckoutSession,
);
router.post(
  "/confirm-checkout",
  authenticate,
  PaymentsController.confirmCheckoutSession,
);
router.get("/subscription", authenticate, PaymentsController.getSubscription);
router.post("/cancel", authenticate, PaymentsController.cancelSubscription);

export default router;
