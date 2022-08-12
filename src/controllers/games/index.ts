import { ObjectId } from "../base";
import { Keno } from "./casino/keno";
import { Dice } from "./casino/dice";
import { Wheel } from "./casino/wheel";
import { Mines } from "./casino/mines";
import { Limbo } from "./casino/limbo";
import { Plinko } from "./casino/plinko";
import { Diamonds } from "./casino/diamonds";
import { Roulette } from "./casino/roulette";
import { Coinflip } from "./casino/coinflip";
import { Blackjack } from "./casino/blackjack";
import { GameLists, Games } from "../../models";
import { Request, Response, NextFunction } from "express";

export const turn = async (req: Request, res: Response, next: NextFunction) => {
  const game: any = await GameLists.findOne({ id: req.body.gameId });
  if (!game.status) {
    return res.status(400).json("Game is temporarily unavailable.");
  }
  switch (req.body.gameId) {
    case "blackjack":
      return await Blackjack(req, res, next);
    case "wheel":
      return await Wheel(req, res, next);
    case "coinflip":
      return await Coinflip(req, res, next);
    case "diamonds":
      return await Diamonds(req, res, next);
    case "dice":
      return await Dice(req, res, next);
    case "limbo":
      return await Limbo(req, res, next);
    case "plinko":
      return await Plinko(req, res, next);
    case "keno":
      return await Keno(req, res, next);
    case "mines":
      return await Mines(req, res, next);
    case "roulette":
      return await Roulette(req, res, next);
    default:
      break;
  }
};

export const list = async (req: Request, res: Response) => {
  const result = await GameLists.find({ status: true }).sort({
    status: -1,
    order: 1,
    createdAt: -1,
  });
  return res.json(result);
};

export const history = async (req: Request, res: Response) => {
  const { perPage = 10, type = 1, userId = null } = req.body;
  let query = {
    status: { $ne: "BET" },
  } as any;
  if (type === 0 && userId) {
    query.userId = ObjectId(userId);
  }
  if (!userId) {
    const date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(firstDay.getTime() + 2678400000);
    query.createdAt = { $gte: firstDay, $lte: lastDay };
  }
  const results = await Games.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "game_lists",
        localField: "gameId",
        foreignField: "_id",
        as: "game",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $unwind: "$game",
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 1,
        username: {
          $concat: [
            {
              $substrCP: ["$user.username", 0, 2],
            },
            "**********",
          ],
        },
        currency: "$currency.icon",
        game: {
          icon: "$game.icon",
          name: "$game.name",
        },
        amount: 1,
        profit: 1,
        status: 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $limit: perPage },
  ]);
  return res.json(results);
};
