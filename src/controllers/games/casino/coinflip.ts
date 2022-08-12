import * as crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { GameLists, Games } from "../../../models";
import {
  checkBalance,
  checkMaxBet,
  generatInfo,
  getProfit,
  handleBet,
} from "../../base";

const coinflips = [
  { index: "front", color: "yellow" },
  { index: "back", color: "blue" },
];

const getNumber = ({
  amount,
  color,
  current = false,
}: {
  amount: number;
  color: string;
  current?: boolean | undefined;
}) => {
  if (current) {
    const number = coinflips.find((e) => e.color !== color);
    return { status: "LOST", odds: 0, profit: 0, ...number };
  } else {
    const seed = crypto
      .createHash("sha256")
      .update(`${Date.now()}`)
      .digest("hex");
    const timestamp = Date.now();
    const nonce = (Math.random() * 100000).toFixed(0);
    let resultHash = crypto
      .createHash("sha256")
      .update(seed + "_" + timestamp + "_" + nonce)
      .digest("hex");
    resultHash = resultHash.substring(0, 10);
    let result = parseInt(resultHash, 16);
    const winner = coinflips[result % 2];
    if (color === winner.color) {
      return { status: "WIN", odds: 2, profit: amount * 2, ...winner };
    } else {
      return { status: "LOST", odds: 0, profit: 0, ...winner };
    }
  }
};

export const Coinflip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, currency, amount, color } = req.body;
  const gamelist: any = await GameLists.findOne({ id: req.body.gameId });
  const gameId = gamelist._id;
  const checkedMax = await checkMaxBet({ currency, amount });
  const checked = await checkBalance({ userId, currency, amount });
  if (!checked) {
    return res.status(400).json("Balances not enough!");
  }
  if (!checkedMax) {
    return res.status(400).json("Maximum bet exceeded!");
  }
  await handleBet({
    req,
    currency,
    userId,
    amount: amount * -1,
    type: "casino-bet(coinfilp)",
    info: generatInfo(),
  });
  const { input, output } = await getProfit(currency);
  const odds = 2;
  const data = {
    providerId: gamelist.providerId,
    userId,
    currency,
    gameId,
    amount,
    betting: req.body,
    odds,
  };
  if (((output + amount * odds) / (input + amount)) * 100 >= gamelist.rtp) {
    const result = getNumber({ amount, color, current: true });
    await Games.create({
      status: result.status,
      profit: result.profit,
      aBetting: result,
      ...data,
    });
    res.json({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      index: result.index,
    });
  } else {
    const result = getNumber({ amount, color });
    const games: any = await Games.create({
      status: result.status,
      profit: result.profit,
      aBetting: result,
      ...data,
    });
    res.json({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      index: result.index,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(coinfilp)",
          info: games._id,
        });
      }, 1000);
    }
  }
};
