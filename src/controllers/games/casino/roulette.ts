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
const RandomSeed = require("random-seed");

const PatternNum = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as any;

const BetSet = {
  "1-12": { value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], odds: 3 },
  "13-24": { value: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], odds: 3 },
  "25-36": { value: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], odds: 3 },
  "1-18": {
    value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    odds: 2,
  },
  "19-36": {
    value: [
      19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    ],
    odds: 2,
  },
  row1: { value: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], odds: 3 },
  row2: { value: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], odds: 3 },
  row3: { value: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], odds: 3 },
  red: {
    value: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    odds: 2,
  },
  black: {
    value: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    odds: 2,
  },
  even: {
    value: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
    odds: 2,
  },
  odd: {
    value: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
    odds: 2,
  },
} as any;

const getProfits = (number: number, bet: any) => {
  let win = 0;
  for (const key in bet) {
    if (PatternNum[key] !== undefined) {
      if (PatternNum[key] === number) {
        win += bet[key] * 36;
      }
    } else if (BetSet[key] !== undefined) {
      if (BetSet[key].value.indexOf(number) !== -1) {
        win += bet[key] * BetSet[key].odds;
      }
    }
  }
  return win;
};

const getNumber = ({
  amount,
  bet,
  current = false,
}: {
  amount: number;
  bet: any;
  current?: boolean | undefined;
}) => {
  const seed = crypto
    .createHash("sha256")
    .update(`${Date.now()}`)
    .digest("hex");
  const rand = RandomSeed(seed);
  if (current) {
    let data = [] as any;
    for (const i in PatternNum) {
      data.push({
        profit: getProfits(PatternNum[i], bet),
        number: PatternNum[i],
      });
    }
    let result = data.sort(
      (a: any, b: any) => a.profit - b.profit || b.number - a.number
    );
    const randomNum = rand.range(
      data.filter((e: any) => e.profit <= amount).length
    );
    result = result[randomNum];
    const win = result.profit;
    if (win > amount) {
      return {
        status: "WIN",
        odds: win / amount,
        profit: win,
        number: result.number,
      };
    } else if (win === amount) {
      return {
        status: "DRAW",
        odds: win / amount,
        profit: win,
        number: result.number,
      };
    } else {
      return {
        status: "LOST",
        odds: win / amount,
        profit: win,
        number: result.number,
      };
    }
  } else {
    const randomNum = rand.range(37);
    const number = PatternNum[randomNum];
    const win = getProfits(number, bet);
    if (win > amount) {
      return { status: "WIN", odds: win / amount, profit: win, number };
    } else if (win === amount) {
      return { status: "DRAW", odds: win / amount, profit: win, number };
    } else {
      return { status: "LOST", odds: win / amount, profit: win, number };
    }
  }
};

export const Roulette = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, currency, amount, bet } = req.body;
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
    type: "casino-bet(roulette)",
    info: generatInfo(),
  });
  const { input, output } = await getProfit(currency);
  const result = getNumber({ amount, bet });
  const data = {
    providerId: gamelist.providerId,
    userId,
    currency,
    gameId,
    amount,
    betting: req.body,
  };
  if (((output + result.profit) / (input + amount)) * 100 >= gamelist.rtp) {
    const result = getNumber({ amount, bet, current: true });
    const games: any = await Games.create({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      aBetting: result,
      ...data,
    });
    res.json({
      status: result.status,
      number: result.number,
      odds: result.odds,
      profit: result.profit,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(roulette)",
          info: games._id,
        });
      }, 3000);
    }
  } else {
    const games: any = await Games.create({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      aBetting: result,
      ...data,
    });
    res.json({
      status: result.status,
      number: result.number,
      odds: result.odds,
      profit: result.profit,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(roulette)",
          info: games._id,
        });
      }, 3000);
    }
  }
};
