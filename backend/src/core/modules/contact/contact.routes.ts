import { Router } from "express";
import { ContactController } from "./contact.controller";
import { optionalAuthenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", optionalAuthenticate, ContactController.submitMessage);

export default router;
