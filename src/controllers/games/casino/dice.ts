import * as crypto from "crypto";
import { GameLists, Games } from "../../../models";
import { Request, Response, NextFunction } from "express";
import {
  checkBalance,
  checkMaxBet,
  generatInfo,
  getProfit,
  handleBet,
} from "../../base";

const getNumber = ({
  amount,
  multiplier,
  target,
  mode,
  current = false,
}: {
  amount: number;
  multiplier: number;
  target: number;
  mode: boolean;
  current?: boolean | undefined;
}) => {
  if (current) {
    if (mode) {
      const roll = Math.floor(Math.random() * target) - 1;
      return { status: "LOST", odds: 0, profit: 0, roll };
    } else {
      const roll = Math.floor(Math.random() * (10000 - target + 1)) + target;
      return { status: "LOST", odds: 0, profit: 0, roll };
    }
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
    result = result % 10001;
    if (mode) {
      if (result > target) {
        return {
          status: "WIN",
          odds: multiplier,
          profit: amount * multiplier,
          roll: result,
        };
      } else {
        return { status: "LOST", odds: 0, profit: 0, roll: result };
      }
    } else {
      if (result < target) {
        return {
          status: "WIN",
          odds: multiplier,
          profit: amount * multiplier,
          roll: result,
        };
      } else {
        return { status: "LOST", odds: 0, profit: 0, roll: result };
      }
    }
  }
};

export const Dice = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, currency, amount, multiplier, target, mode } = req.body;
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
  if (multiplier <= 1 || multiplier > 2000) {
    return res.status(400).json("Invalid odds!");
  }
  await handleBet({
    req,
    currency,
    userId,
    amount: amount * -1,
    type: "casino-bet(dice)",
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
    const result = getNumber({
      amount,
      multiplier,
      target,
      mode,
      current: true,
    });
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
      roll: result.roll,
    });
  } else {
    const result = getNumber({ amount, multiplier, target, mode });
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
      roll: result.roll,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(dice)",
          info: games._id,
        });
      }, 3000);
    }
  }
};
