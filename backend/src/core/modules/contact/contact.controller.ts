import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ContactService } from "./contact.service";
import { contactMessageSchema } from "./contact.validation";

export class ContactController {
  static submitMessage = asyncHandler(async (req: Request, res: Response) => {
    const validated = contactMessageSchema.parse(req.body);
    const userId = req.user?.userId;

    const result = await ContactService.submitMessage(validated, userId);

    res.status(201).json(result);
  });
}
