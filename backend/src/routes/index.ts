import { Router } from "express";
import authRoutes from "../core/modules/auth/auth.routes";
import userRoutes from "../core/modules/user/user.routes";
import likeRoutes from "../core/modules/like/like.routes";
import messageRoutes from "../core/modules/message/message.routes";
import skipRoutes from "../core/modules/skip/skip.routes";
import matchingRoutes from "../core/modules/matching/matching.routes";
import contactRoutes from "../core/modules/contact/contact.routes";
import subscriptionRoutes from "../core/modules/subscription/subscription.routes";
import paymentsRoutes from "../core/modules/payments/payments.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/likes", likeRoutes);
router.use("/skips", skipRoutes);
router.use("/messages", messageRoutes);
router.use("/matching", matchingRoutes);
router.use("/contact", contactRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/payments", paymentsRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
