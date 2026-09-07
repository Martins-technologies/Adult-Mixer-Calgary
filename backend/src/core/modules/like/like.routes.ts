import { Router } from "express";
import { LikeController } from "./like.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/sent", authenticate, LikeController.getSentLikes);
router.get("/received", authenticate, LikeController.getReceivedLikes);
router.post("/", authenticate, LikeController.createLike);
router.delete("/", authenticate, LikeController.deleteLike);

export default router;
