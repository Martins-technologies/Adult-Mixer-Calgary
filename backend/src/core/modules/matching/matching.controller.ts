import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../errors/AppError";
import { MatchingService } from "./matching.service";

export class MatchingController {
  static getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const suggestions = await MatchingService.getSuggestions(
      req.user.userId,
      limit,
      offset,
    );

    res.status(200).json(suggestions);
  });

  static getTopMatches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const limit = parseInt(req.query.limit as string) || 3;

    const topMatches = await MatchingService.getTopMatches(
      req.user.userId,
      limit,
    );

    res.status(200).json(topMatches);
  });
}
