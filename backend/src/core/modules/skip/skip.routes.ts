import { Router } from "express";
import { SkipController } from "./skip.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, SkipController.createSkip);

export default router;
