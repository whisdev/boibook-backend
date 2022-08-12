import { Request, Response, NextFunction } from "express";
import { GameLists, Games } from "../../../models";
import {
  checkBalance,
  checkMaxBet,
  generatInfo,
  getProfit,
  handleBet,
  random,
} from "../../base";

const numbers = {
  1: [0, 1.8],
  2: [0, 1.96, 3.6],
  3: [0, 0, 1.5, 24],
  4: [0, 0, 2.1, 7.8, 88.6],
  5: [0, 0, 1.5, 4, 12, 292],
  6: [0, 0, 0, 1.8, 6, 100, 600],
  7: [0, 0, 0, 1.7, 3.2, 14, 200, 700],
  8: [0, 0, 0, 1.5, 2, 5, 39, 100, 800],
  9: [0, 0, 0, 1.4, 1.6, 2.3, 7, 40, 200, 900],
  10: [0, 0, 0, 1.3, 1.4, 1.5, 2.6, 10, 30, 200, 1000],
} as any;

const numbers40 = Array.from(Array(40).keys());

const getNumber = ({
  amount,
  selected,
  current = false,
}: {
  amount: number;
  selected: number[];
  current?: boolean | undefined;
}) => {
  let picked = [] as any;
  while (picked.length < 10) {
    let rand = random(1, 40);
    if (picked.includes(rand)) continue;
    picked.push(rand);
  }
  let count = 0;
  let match = [] as any;
  let notMatch = [] as any;
  let notnumbers = [] as any;
  for (const i in numbers40) {
    if (!selected.includes(numbers40[i] + 1)) {
      notnumbers.push(numbers40[i] + 1);
    }
  }
  for (const i in picked) {
    if (selected.includes(picked[i])) {
      match.push(picked[i]);
      count++;
    } else {
      notMatch.push(picked[i]);
    }
  }
  const odds = numbers[String(selected.length)][count];
  if (current) {
    const length =
      numbers[String(selected.length)].filter((e: number) => e === 0).length -
      1;
    if (match.length > length) {
      while (notMatch.length < 10) {
        const rand = notnumbers[Math.floor(Math.random() * notnumbers.length)];
        if (notMatch.includes(rand)) continue;
        notMatch.push(rand);
      }
      const odds = 0;
      return { status: "LOST", odds, profit: amount * odds, picked: notMatch };
    } else {
      return { status: "LOST", odds, profit: amount * odds, picked };
    }
  } else {
    if (odds > 1) {
      return { status: "WIN", odds, profit: amount * odds, picked };
    } else {
      return { status: "LOST", odds, profit: amount * odds, picked };
    }
  }
};

export const Keno = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, currency, amount, selected } = req.body;
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
  if (!selected || selected.length < 1) {
    return res.status(400).json("Please select keno!");
  }
  await handleBet({
    req,
    currency,
    userId,
    amount: amount * -1,
    type: "casino-bet(keno)",
    info: generatInfo(),
  });

  const toFindDuplicates = (selected: number[]) =>
    selected.filter(
      (item: number, index: number) => selected.indexOf(item) !== index
    );
  const duplicate = toFindDuplicates(selected);
  if (duplicate.length > 0) {
    return res.status(400).json("Please select keno!");
  }

  const result = getNumber({ amount, selected });
  const { input, output } = await getProfit(currency);
  const data = {
    providerId: gamelist.providerId,
    userId,
    currency,
    gameId,
    amount,
    betting: req.body,
    odds: result.odds,
  };
  if (((output + result.profit) / (input + amount)) * 100 >= gamelist.rtp) {
    const result = getNumber({ amount, selected, current: true });
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
      picked: result.picked,
    });
  } else {
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
      picked: result.picked,
    });
    if (result.odds > 0) {
      setTimeout(async () => {
        await handleBet({
          req,
          currency,
          userId,
          amount: result.profit,
          type: "casino-bet-settled(keno)",
          info: games._id,
        });
      }, 2000);
    }
  }
};
