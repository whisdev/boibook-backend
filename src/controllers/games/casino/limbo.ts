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

export const getNumber = ({
  amount,
  multiplier,
  current = false,
}: {
  amount: number;
  multiplier: number;
  current?: boolean | undefined;
}) => {
  if (current) {
    const payout = Number(
      Number((Math.random() * multiplier).toFixed(2)) - 0.01
    );
    return { status: "LOST", odds: 0, profit: 0, payout };
  } else {
    const seed = crypto
      .createHash("sha256")
      .update(`${Date.now()}`)
      .digest("hex");
    const timestamp = Date.now();
    const nonce = (Math.random() * 100000).toFixed(0);
    let hash = crypto
      .createHash("sha256")
      .update(seed + "_" + timestamp + "_" + nonce)
      .digest("hex");
    const nBits = 52;
    hash = hash.slice(0, nBits / 4);
    const r = parseInt(hash, 16);
    let X = r / Math.pow(2, nBits);
    X = 99 / (1 - X);
    const result = Math.floor(X);
    const payout = Number(Math.max(1, result / 100).toFixed(2));
    if (payout >= multiplier) {
      return {
        status: "WIN",
        odds: multiplier,
        profit: multiplier * amount,
        payout,
      };
    } else {
      return { status: "LOST", odds: 0, profit: 0, payout };
    }
  }
};

export const Limbo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, currency, amount, multiplier } = req.body;
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
  if (multiplier <= 1) {
    return res.status(400).json("Invalid odds!");
  }
  await handleBet({
    req,
    currency,
    userId,
    amount: amount * -1,
    type: "casino-bet(limbo)",
    info: generatInfo(),
  });
  const { input, output } = await getProfit(currency);
  const odds = multiplier;
  const data = {
    providerId: gamelist.providerId,
    userId,
    currency,
    gameId,
    amount,
    betting: req.body,
    odds,
  };
  if (((output + odds * amount) / (input + amount)) * 100 >= gamelist.rtp) {
    const result = getNumber({ amount, multiplier, current: true });
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
      payout: result.payout,
    });
  } else {
    const result = getNumber({ amount, multiplier });
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
      payout: result.payout,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(limbo)",
          info: games._id,
        });
      }, 3000);
    }
  }
};
