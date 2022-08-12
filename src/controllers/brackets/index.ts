import { generatInfo, handleBet, ObjectId } from "../base";
import {
  Balances,
  Currencies,
  BracketsBets,
  BracketsMatchs,
} from "../../models";
import { Request, Response } from "express";

export const getBracketBet = async (req: Request, res: Response) => {
  const result = await BracketsBets.aggregate([
    {
      $match: {
        _id: ObjectId(req.params.id),
      },
    },
    {
      $lookup: {
        from: "brackets_matchs",
        localField: "matchId",
        foreignField: "_id",
        as: "match",
      },
    },
    {
      $unwind: "$match",
    },
  ]);
  return res.json(result[0]);
};

export const betBracket = async (req: Request, res: Response) => {
  const { userId, bracket, matchId } = req.body;
  const match: any = await BracketsMatchs.findById(ObjectId(matchId));
  if (Date.now() > new Date(match.time).getTime())
    return res
      .status(400)
      .json(
        "The bracket can no longer be submitted and has already been started."
      );
  const currency: any = await Currencies.findOne({ symbol: "MBT" });
  const balance: any = await Balances.findOne({ userId, currency: currency._id });
  if (balance) {
    const amount = 200 / currency.price;
    if (balance.balance < amount) {
      return res.status(400).json("MBT is not enough.");
    } else {
      const result = await BracketsBets.create({
        userId,
        currency: currency._id,
        stake: amount,
        matchId,
        bracket,
      });
      if (result) {
        await handleBet({
          req,
          currency: currency._id,
          userId,
          amount: amount * -1,
          type: "sports-brackets-bet",
          info: generatInfo(),
        });
        return res.json("Success!");
      } else {
        return res.status(400).json("Error.");
      }
    }
  } else {
    return res.status(400).json("Please deposit MBT.");
  }
};

export const getBracketHistory = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await BracketsBets.aggregate([
    { $match: { userId: ObjectId(userId) } },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $project: { "currency.abi": 0 },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  return res.json(result);
};

export const getBracketLeaderBoard = async (req: Request, res: Response) => {
  const result = await BracketsBets.aggregate([
    { $match: { matchId: ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
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
              $substrCP: ["$user.username", 0, 1],
            },
            "**********",
          ],
        },
        point: 1,
      },
    },
    {
      $sort: {
        point: -1,
      },
    },
  ]);
  return res.json(result);
};

export const getBracketMatchs = async (req: Request, res: Response) => {
  const result = await BracketsMatchs.aggregate([
    {
      $lookup: {
        from: "brackets_bets",
        localField: "_id",
        foreignField: "matchId",
        as: "bet",
      },
    },
    {
      $unwind: "$bet",
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          sportId: "$sportId",
          name: "$name",
          events: "$events",
          rounds: "$rounds",
          time: "$time",
          time_status: "$time_status",
        },
        total: { $sum: "$bet.stake" },
      },
    },
    {
      $project: {
        _id: "$_id._id",
        sportId: "$_id.sportId",
        name: "$_id.name",
        events: "$_id.events",
        rounds: "$_id.rounds",
        time: "$_id.time",
        time_status: "$_id.time_status",
        total: {
          $multiply: ["$total", 0.9],
        },
      },
    },
  ]);
  return res.json(result);
};

export const updateBracketPoint = async (id: string) => {
  const matchs = await BracketsMatchs.findById(id);
  if (!matchs) return;
  const bets: any = await BracketsBets.find();
  let result = {} as any;
  const points = [
    { key: 1, title: "First Round", value: 1 },
    { key: 2, title: "Second Round", value: 2 },
    { key: 3, title: "Sweet 16", value: 4 },
    { key: 4, title: "Elite 8", value: 6 },
    { key: 5, title: "Final Four", value: 8 },
    { key: 6, title: "Championship", value: 10 },
  ];
  for (const i in bets) {
    const bracket = bets[i].bracket as any;
    result[bets[i]._id] = 0;
    for (const j in bracket) {
      for (let k = 1; k < 6; k++) {
        if (bracket[j].round === k + 1) {
          const match = matchs.events.find(
            (e: any) => e.round === k + 1 && e.pid === bracket[j].pid
          );
          const point = points.find((e) => e.key === k) as any;
          if (
            match.team1?.name === bracket[j].team1?.name &&
            match.team1?.id === bracket[j].team1?.id
          ) {
            result[bets[i]._id] = result[bets[i]._id] + point.value;
          }
          if (
            match.team2?.name === bracket[j].team2?.name &&
            match.team2?.id === bracket[j].team2?.id
          ) {
            result[bets[i]._id] = result[bets[i]._id] + point.value;
          }
        }
      }
    }
    const fMatch = matchs.events.find((e: any) => e.position === 4);
    const bMatch = bracket.find((e: any) => e.position === 4);
    if (fMatch.team1?.name === bMatch.team1?.name) {
      result[bets[i]._id] = result[bets[i]._id] + 10;
    }
  }
  for (const key in result) {
    const point = result[key];
    await BracketsBets.findByIdAndUpdate(ObjectId(key), { point });
  }
};
