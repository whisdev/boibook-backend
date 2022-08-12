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
  3: {
    1: 1.12,
    2: 1.28,
    3: 1.47,
    4: 1.71,
    5: 1.99,
    6: 2.34,
    7: 2.79,
    8: 3.34,
    9: 4.06,
    10: 5,
    11: 6.25,
    12: 7.96,
    13: 10.35,
    14: 13.8,
    15: 18.97,
    16: 27.1,
    17: 40.66,
    18: 65.05,
    19: 113.85,
    20: 227.7,
    21: 569.25,
    22: 2277,
  },
  4: {
    1: 1.17,
    2: 1.41,
    3: 1.71,
    4: 2.09,
    5: 2.58,
    6: 3.23,
    7: 4.09,
    8: 5.26,
    9: 6.88,
    10: 9.17,
    11: 12.51,
    12: 17.51,
    13: 25.3,
    14: 37.95,
    15: 59.63,
    16: 99.39,
    17: 178.9,
    18: 357.8,
    19: 834.9,
    20: 2504.7,
    21: 12523.5,
  },
  5: {
    1: 1.23,
    2: 1.56,
    3: 1.99,
    4: 2.58,
    5: 3.39,
    6: 4.52,
    7: 6.13,
    8: 8.5,
    9: 12.04,
    10: 17.51,
    11: 26.27,
    12: 40.86,
    13: 66.41,
    14: 113.85,
    15: 208.72,
    16: 417.45,
    17: 939.26,
    18: 2504.7,
    19: 8766.45,
    20: 52598.7,
  },
  6: {
    1: 1.3,
    2: 1.73,
    3: 2.34,
    4: 3.23,
    5: 4.52,
    6: 6.46,
    7: 9.44,
    8: 14.16,
    9: 21.89,
    10: 35.03,
    11: 58.38,
    12: 102.17,
    13: 189.75,
    14: 379.5,
    15: 834.9,
    16: 2087.25,
    17: 6261.75,
    18: 25047,
    19: 175329,
  },
  7: {
    1: 1.37,
    2: 1.94,
    3: 2.79,
    4: 4.09,
    5: 6.13,
    6: 9.44,
    7: 14.95,
    8: 24.47,
    9: 41.59,
    10: 73.95,
    11: 138.66,
    12: 277.32,
    13: 600.87,
    14: 1442.1,
    15: 3965.77,
    16: 13219.25,
    17: 59486.62,
    18: 475893,
  },
  8: {
    1: 1.45,
    2: 2.18,
    3: 3.34,
    4: 5.26,
    5: 8.5,
    6: 14.16,
    7: 24.47,
    8: 44.04,
    9: 83.19,
    10: 166.39,
    11: 356.56,
    12: 831.98,
    13: 2163.15,
    14: 6489.45,
    15: 23794.64,
    16: 118973.25,
    17: 1070759.25,
  },
  9: {
    1: 1.54,
    2: 2.47,
    3: 4.06,
    4: 6.88,
    5: 12.04,
    6: 21.89,
    7: 41.59,
    8: 83.19,
    9: 176.79,
    10: 404.1,
    11: 1010.26,
    12: 2828.73,
    13: 9193.38,
    14: 36773.55,
    15: 202254.52,
    16: 2022545.25,
  },
  10: {
    1: 1.65,
    2: 2.82,
    3: 5,
    4: 9.17,
    5: 17.51,
    6: 35.03,
    7: 73.95,
    8: 166.39,
    9: 404.1,
    10: 1077.61,
    11: 3232.83,
    12: 11314.93,
    13: 49031.4,
    14: 294188.4,
    15: 3236072.4,
  },
  11: {
    1: 1.76,
    2: 3.26,
    3: 6.25,
    4: 12.51,
    5: 26.27,
    6: 58.38,
    7: 138.66,
    8: 356.56,
    9: 1010.26,
    10: 3232.83,
    11: 12123.14,
    12: 56574.69,
    13: 367735.5,
    14: 4412826,
  },
  12: {
    1: 1.9,
    2: 3.8,
    3: 7.96,
    4: 17.51,
    5: 40.86,
    6: 102.17,
    7: 277.32,
    8: 831.98,
    9: 2828.73,
    10: 11314.93,
    11: 56574.69,
    12: 396022.84,
    13: 5148297,
  },
  13: {
    1: 2.06,
    2: 4.5,
    3: 10.35,
    4: 25.3,
    5: 66.41,
    6: 189.75,
    7: 600.87,
    8: 2163.15,
    9: 9193.38,
    10: 49031.4,
    11: 367735.5,
    12: 5148297,
  },
  14: {
    1: 2.25,
    2: 5.4,
    3: 13.8,
    4: 37.95,
    5: 113.85,
    6: 379.5,
    7: 1442.1,
    8: 6489.45,
    9: 36773.55,
    10: 294188.39,
    11: 4412826,
  },
  15: {
    1: 2.47,
    2: 6.6,
    3: 18.97,
    4: 59.63,
    5: 208.725,
    6: 834.9,
    7: 3965.77,
    8: 23794.65,
    9: 202254.52,
    10: 3236072.4,
  },
  16: {
    1: 2.75,
    2: 8.25,
    3: 27.1,
    4: 99.39,
    5: 417.45,
    6: 2087.25,
    7: 13219.25,
    8: 118973.25,
    9: 2022545.25,
  },
  17: {
    1: 3.09,
    2: 10.6,
    3: 40.66,
    4: 178.9,
    5: 939.26,
    6: 6261.75,
    7: 59486.62,
    8: 1070759.25,
  },
  18: {
    1: 3.53,
    2: 14.14,
    3: 65.05,
    4: 357.81,
    5: 2504.7,
    6: 25047,
    7: 475893,
  },
  19: {
    1: 4.12,
    2: 19.8,
    3: 113.85,
    4: 834.9,
    5: 8766.44,
    6: 175329,
  },
  20: {
    1: 4.95,
    2: 29.7,
    3: 227.7,
    4: 2504.7,
    5: 52598.7,
  },
  21: {
    1: 6.18,
    2: 49.5,
    3: 569.25,
    4: 12523.5,
  },
  22: {
    1: 8.25,
    2: 99,
    3: 2277,
  },
  23: {
    1: 12.37,
    2: 297,
  },
  24: {
    1: 24.75,
  },
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
    let rand = random(1, 25);
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

export const Mines = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    return res.status(400).json("Please select mines!");
  }

  const toFindDuplicates = (selected: number[]) =>
    selected.filter(
      (item: number, index: number) => selected.indexOf(item) !== index
    );
  const duplicate = toFindDuplicates(selected);
  if (duplicate.length > 0) {
    return res.status(400).json("Please select mines!");
  }

  await handleBet({
    req,
    currency,
    userId,
    amount: amount * -1,
    type: "casino-bet(mines)",
    info: generatInfo(),
  });
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
          type: "casino-bet-settled(mines)",
          info: games._id,
        });
      }, 2000);
    }
  }
};
