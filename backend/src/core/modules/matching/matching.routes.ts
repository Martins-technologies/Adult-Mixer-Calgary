import { Router } from "express";
import { MatchingController } from "./matching.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/suggestions", authenticate, MatchingController.getSuggestions);
router.get("/top", authenticate, MatchingController.getTopMatches);

export default router;
