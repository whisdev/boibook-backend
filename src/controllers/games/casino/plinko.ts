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

const gameData = {
  low: {
    "8": [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    "10": [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    "12": [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    "14": [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    "16": [
      16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16,
    ],
  },
  medium: {
    "8": [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    "10": [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    "12": [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    "14": [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    "16": [110, 41, 1, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  high: {
    "8": [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    "10": [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    "12": [170, 24, 8.1, 2, 0.7, 0.3, 0.2, 0.3, 0.7, 2, 8.1, 24, 170],
    "14": [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.1, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    "16": [
      1000, 130, 26, 9, 4, 2, 0.3, 0.2, 0.1, 0.2, 0.3, 2, 4, 9, 26, 130, 1000,
    ],
  },
} as any;

export const getNumber = ({
  difficulty,
  pins,
  amount,
  current = false,
}: {
  difficulty: string;
  pins: number;
  amount: number;
  current?: boolean | undefined;
}) => {
  if (current) {
    const odds = Math.min.apply(null, gameData[difficulty][pins]);
    const target = gameData[difficulty][pins].indexOf(odds);
    return {
      status: "LOST",
      odds: odds,
      profit: Number((odds * amount).toFixed(10)),
      target,
    };
  } else {
    const odds = gameData[difficulty][pins];
    const oddslist = [] as any;
    for (const i in odds) {
      oddslist.push({
        pct: Math.floor((1 / (1 + odds[i])) * 100),
        odds: odds[i],
        profit: Number((amount * odds[i]).toFixed(10)),
        target: gameData[difficulty][pins].indexOf(odds[i]),
      });
    }
    const expanded = oddslist.flatMap((item: any) =>
      Array(item.pct).fill(item)
    );
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
    const winner = expanded[result % expanded.length];
    if (winner.odds === 1) {
      return { status: "DRAW", ...winner };
    } else if (winner.odds > 1) {
      return { status: "WIN", ...winner };
    } else {
      return { status: "LOST", ...winner };
    }
  }
};

export const Plinko = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, currency, amount, difficulty, pins } = req.body;
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
    type: "casino-bet(plinko)",
    info: generatInfo(),
  });
  const { input, output } = await getProfit(currency);
  const result = getNumber({ amount, difficulty, pins });
  const data = {
    providerId: gamelist.providerId,
    userId,
    currency,
    gameId,
    amount,
    betting: req.body,
  };
  if (((output + result.profit) / (input + amount)) * 100 >= gamelist.rtp) {
    const result = getNumber({ amount, difficulty, pins, current: true });
    const games: any = await Games.create({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      aBetting: result,
      ...data,
    });
    res.json({
      status: result.status,
      profit: result.profit,
      odds: result.odds,
      target: result.target,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(plinko)",
          info: games._id,
        });
      }, 300 * gameData[difficulty][pins].length + 1000);
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
      profit: result.profit,
      odds: result.odds,
      target: result.target,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(plinko)",
          info: games._id,
        });
      }, 300 * gameData[difficulty][pins].length + 1000);
    }
  }
};
