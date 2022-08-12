import * as moment from "moment";
import { Request, Response } from "express";
import { getProfit, ObjectId, toNumber } from "../base";
import {
  Users,
  Permissions,
  SportsBets,
  Payments,
  Sessions,
  Balances,
  LoginHistories,
  Currencies,
  SportsBetting,
  BracketsBets,
  Games,
  BalanceHistories,
} from "../../models";

const filter = (data: any) => (data ? data : 0);

const addDays = (days: number, dates: Date) => {
  let date = new Date(dates.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

const getDates = (startDate: any, stopDate: any) => {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = addDays(1, currentDate);
  }
  return dateArray;
};

const getChartData = async (qdate: any) => {
  const query = [
    {
      $match: {
        createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$_id" },
          month: { $month: "$_id" },
          day: { $dayOfMonth: "$_id" },
        },
        Total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        Total: 1,
        name: {
          $concat: [
            { $convert: { input: "$_id.year", to: "string" } },
            "-",
            { $convert: { input: "$_id.month", to: "string" } },
            "-",
            { $convert: { input: "$_id.day", to: "string" } },
          ],
        },
      },
    },
  ];
  const cUsers = await Users.aggregate(query);
  const cSportsBets = await SportsBets.aggregate(query);
  const cBets = await Games.aggregate(query);
  const cPayments = await Payments.aggregate([
    { $match: { $and: [{ status: { $ne: 0 } }, { status: { $ne: -1 } }] } },
    ...query,
  ]);
  const cLoginHistories = await LoginHistories.aggregate(query);
  const cData = [
    {
      count: cBets.length,
      value: cBets,
    },
    {
      count: cUsers.length,
      value: cUsers,
    },
    {
      count: cSportsBets.length,
      value: cSportsBets,
    },
    {
      count: cPayments.length,
      value: cPayments,
    },
    {
      count: cLoginHistories.length,
      value: cLoginHistories,
    },
  ].sort((a, b) => b.count - a.count)[0];
  const date = cData.value.map((item) => item.name);
  const charts = [] as any;
  for (const i in date) {
    const user = cUsers.find((e) => e.name === date[i])?.Total;
    const bet1 = cSportsBets.find((e) => e.name === date[i])?.Total;
    const bet2 = cBets.find((e) => e.name === date[i])?.Total;
    const payment = cPayments.find((e) => e.name === date[i])?.Total;
    const login = cLoginHistories.find((e) => e.name === date[i])?.Total;
    const result = {
      user: filter(user),
      bet: filter(bet1) + filter(bet2),
      payment: filter(payment),
      login: filter(login),
      name: date[i],
    };
    charts.push(result);
  }
  charts.sort(
    (a: any, b: any) => new Date(a.name).valueOf() - new Date(b.name).valueOf()
  );
  return charts;
};

const getPlayerData = async (qdate: any) => {
  const permission:any = await Permissions.findOne({ title: "player" });
  const players:any = await Users.countDocuments({
    permissionId: permission._id,
    createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
  });
  const login = await LoginHistories.countDocuments({
    createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
  });
  const logined = await Sessions.countDocuments({
    createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
  });
  const bets = await SportsBets.countDocuments({
    createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
  });
  const games = await Games.countDocuments({
    createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
  });
  return { players, login, logined, bets, games };
};

const getSportsBetData = async (qdate: any) => {
  const balances = await Balances.aggregate([
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
      $group: {
        _id: {
          currency: "$currency",
        },
        balance: { $sum: "$balance" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        balance: 1,
        count: 1,
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        usd: {
          $multiply: ["$balance", "$_id.currency.price"],
        },
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const payments = await Payments.aggregate([
    {
      $match: {
        $and: [
          { status: { $ne: 0 } },
          { status: { $ne: -1 } },
          { createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) } },
        ],
      },
    },
    {
      $lookup: {
        from: "balances",
        localField: "balanceId",
        foreignField: "_id",
        as: "balance",
      },
    },
    {
      $unwind: "$balance",
    },
    {
      $lookup: {
        from: "currencies",
        localField: "balance.currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $group: {
        _id: {
          status: "$ipn_type",
          currency: "$currency",
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        amount: 1,
        usd: { $multiply: ["$amount", "$_id.currency.price"] },
        count: 1,
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
        status: 1,
      },
    },
  ]);
  const sportsBets = await SportsBets.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
      },
    },
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
      $group: {
        _id: {
          status: "$status",
          currency: "$currency",
        },
        stake: { $sum: "$stake" },
        profit: { $sum: "$profit" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        stake: 1,
        profit: 1,
        count: 1,
        revenue: { $subtract: ["$profit", "$stake"] },
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const currencies = await Currencies.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        _id: 0,
        order: "$order",
        currency: "$symbol",
        icon: "$icon",
        price: "$price",
      },
    },
  ]);
  const data = [] as any;
  for (const i in currencies) {
    const sportsbet = sportsBets.filter(
      (e) => e.currency === currencies[i].currency
    );
    const balance = balances.find((e) => e.currency === currencies[i].currency);
    const deposit = payments.find(
      (e) => e.currency === currencies[i].currency && e.status === "deposit"
    );
    const withdrawal = payments.find(
      (e) => e.currency === currencies[i].currency && e.status === "withdrawal"
    );
    let win = 0;
    let winstake = 0;
    let lost = 0;
    let refund = 0;
    let profit = 0;
    let bet = 0;
    let activebet = 0;
    let count = 0;
    for (const j in sportsbet) {
      const status = sportsbet[j].status;
      if (status === "WIN" || status === "HALF_WIN") {
        win += sportsbet[j].profit;
        winstake += sportsbet[j].stake;
      } else if (status === "LOST" || status === "HALF_LOST") {
        lost += sportsbet[j].profit * -1;
      } else if (status === "REFUND" || status === "CANCEL") {
        refund += sportsbet[j].stake;
      } else if (status === "BET") {
        activebet += sportsbet[j].stake;
      }
      bet += sportsbet[j].stake;
      count += sportsbet[j].count;
    }
    profit = lost - (win - winstake);
    data.push({
      icon: currencies[i].icon,
      order: currencies[i].order,
      currency: currencies[i].currency,
      price: currencies[i].price,
      balance: filter(balance?.balance),
      deposit: filter(deposit?.amount),
      withdrawal: filter(withdrawal?.amount),
      count,
      win,
      lost,
      profit,
      bet,
      activebet,
      refund,
    });
  }
  data.sort((a: any, b: any) => a.order - b.order);
  return data;
};

const getCasinoBetData = async (qdate: any) => {
  const games = await Games.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(qdate[0]), $lte: new Date(qdate[1]) },
      },
    },
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
      $group: {
        _id: {
          status: "$status",
          currency: "$currency",
        },
        amount: { $sum: "$amount" },
        profit: { $sum: "$profit" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        amount: 1,
        profit: 1,
        count: 1,
        revenue: { $subtract: ["$amount", "$profit"] },
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const currencies = await Currencies.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        order: "$order",
        currency: "$symbol",
        icon: "$icon",
        price: "$price",
      },
    },
  ]);
  const data = [] as any;
  for (const i in currencies) {
    const sportsbet = games.filter(
      (e) => e.currency === currencies[i].currency
    );
    let win = 0;
    let lost = 0;
    let refund = 0;
    let profit = 0;
    let bet = 0;
    let activebet = 0;
    let count = 0;
    for (const j in sportsbet) {
      profit += sportsbet[j].revenue;
      const status = sportsbet[j].status;
      if (status === "WIN") {
        win += sportsbet[j].profit;
      } else if (status === "LOST") {
        lost += sportsbet[j].amount - sportsbet[j].profit;
      } else if (status === "DRAW") {
        refund += sportsbet[j].amount;
      } else if (status === "BET") {
        activebet += sportsbet[j].amount;
      }
      bet += sportsbet[j].amount;
      count += sportsbet[j].count;
    }
    if (count) {
      const profits = await getProfit(currencies[i]._id, qdate);
      data.push({
        icon: currencies[i].icon,
        currency: currencies[i].currency,
        order: currencies[i].order,
        price: currencies[i].price,
        rtp: profits.percent ? profits.percent : 0,
        count,
        win,
        lost,
        profit,
        bet,
        activebet,
        refund,
      });
    }
  }
  data.sort((a: any, b: any) => a.order - b.order);
  return data;
};

export const report = async (req: Request, res: Response) => {
  const { date } = req.body;
  const players = await getPlayerData(date);
  const charts = await getChartData(date);
  const data = await getSportsBetData(date);
  const casino = await getCasinoBetData(date);
  return res.json({ ...players, data, casino, charts });
};

export const getProfits = async (req: Request, res: Response) => {
  const date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  if (new Date().getDate() > 15) {
    firstDay = new Date(firstDay.getTime() + 806400000);
  }
  const lastDay = new Date(firstDay.getTime() + 864000000);
  const sportsBets = await SportsBets.aggregate([
    {
      $match: {
        updatedAt: { $gte: firstDay, $lte: lastDay },
      },
    },
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
      $group: {
        _id: {
          status: "$status",
          currency: "$currency",
        },
        stake: { $sum: "$stake" },
        profit: { $sum: "$profit" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        stake: 1,
        profit: 1,
        count: 1,
        revenue: { $subtract: ["$profit", "$stake"] },
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const currencies = await Currencies.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        _id: 0,
        order: "$order",
        currency: "$symbol",
        icon: "$icon",
        price: "$price",
      },
    },
  ]);
  const mbt = currencies.find((e) => e.currency === "MBT");
  let profit = 0;
  for (const i in currencies) {
    const sportsbet = sportsBets.filter(
      (e) => e.currency === currencies[i].currency
    );
    let win = 0;
    let winstake = 0;
    let lost = 0;
    for (const j in sportsbet) {
      const status = sportsbet[j].status;
      if (status === "WIN" || status === "HALF_WIN") {
        win += sportsbet[j].profit;
        winstake += sportsbet[j].stake;
      } else if (status === "LOST" || status === "HALF_LOST") {
        lost += sportsbet[j].profit * -1;
      }
    }
    profit += (lost - (win - winstake)) * currencies[i].price;
  }
  return res.json({
    profit: toNumber((profit / mbt?.price) * 0.1, 2),
    icon: mbt.icon,
  });
};

export const getUserProfit = async (req: Request, res: Response) => {
  const userId = ObjectId(req.body.userId);
  const createdAt = {
    $gte: new Date(req.body.date[0]),
    $lte: new Date(req.body.date[1]),
  };
  const logined = await LoginHistories.countDocuments({ userId, createdAt });
  const balances = await Balances.aggregate([
    {
      $match: { userId },
    },
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
      $group: {
        _id: {
          currency: "$currency",
        },
        balance: { $sum: "$balance" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        balance: 1,
        count: 1,
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        usd: {
          $multiply: ["$balance", "$_id.currency.price"],
        },
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const payments = await Payments.aggregate([
    {
      $match: {
        $and: [
          { status: { $ne: 0 } },
          { status: { $ne: -1 } },
          { userId, createdAt },
        ],
      },
    },
    {
      $lookup: {
        from: "balances",
        localField: "balanceId",
        foreignField: "_id",
        as: "balance",
      },
    },
    {
      $unwind: "$balance",
    },
    {
      $lookup: {
        from: "currencies",
        localField: "balance.currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $group: {
        _id: {
          status: "$ipn_type",
          currency: "$currency",
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        amount: 1,
        usd: { $multiply: ["$amount", "$_id.currency.price"] },
        count: 1,
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
        status: 1,
      },
    },
  ]);
  const sportsBets = await SportsBets.aggregate([
    {
      $match: {
        userId,
        createdAt,
      },
    },
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
      $group: {
        _id: {
          status: "$status",
          currency: "$currency",
        },
        stake: { $sum: "$stake" },
        profit: { $sum: "$profit" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        stake: 1,
        profit: 1,
        count: 1,
        revenue: { $subtract: ["$profit", "$stake"] },
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const currencies = await Currencies.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        _id: 0,
        order: "$order",
        currency: "$symbol",
        icon: "$icon",
        price: "$price",
      },
    },
  ]);
  const data = [] as any;
  for (const i in currencies) {
    const sportsbet = sportsBets.filter(
      (e) => e.currency === currencies[i].currency
    );
    const balance = balances.find((e) => e.currency === currencies[i].currency);
    const deposit = payments.find(
      (e) => e.currency === currencies[i].currency && e.status === "deposit"
    );
    const withdrawal = payments.find(
      (e) => e.currency === currencies[i].currency && e.status === "withdrawal"
    );
    let win = 0;
    let winstake = 0;
    let lost = 0;
    let refund = 0;
    let profit = 0;
    let bet = 0;
    let activebet = 0;
    let count = 0;
    for (const j in sportsbet) {
      const status = sportsbet[j].status;
      if (status === "WIN" || status === "HALF_WIN") {
        win += sportsbet[j].profit;
        winstake += sportsbet[j].stake;
      } else if (status === "LOST" || status === "HALF_LOST") {
        lost += sportsbet[j].profit * -1;
      } else if (status === "REFUND" || status === "CANCEL") {
        refund += sportsbet[j].stake;
      } else if (status === "BET") {
        activebet += sportsbet[j].stake;
      }
      bet += sportsbet[j].stake;
      count += sportsbet[j].count;
    }
    profit = win - lost - winstake;
    const result = {
      icon: currencies[i].icon,
      currency: currencies[i].currency,
      order: currencies[i].order,
      price: currencies[i].price,
      balance: balance?.balance ? balance.balance : 0,
      deposit: deposit?.amount ? deposit.amount : 0,
      withdrawal: withdrawal?.amount ? withdrawal.amount : 0,
      count,
      win,
      lost,
      profit,
      bet,
      activebet,
      refund,
    };
    if (
      result.balance ||
      result.deposit ||
      result.withdrawal ||
      result.count ||
      result.win ||
      result.lost ||
      result.profit ||
      result.bet ||
      result.activebet ||
      result.refund
    ) {
      data.push(result);
    }
  }
  data.sort((a: any, b: any) => a.order - b.order);
  const query = [
    {
      $match: {
        userId,
        createdAt,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$_id" },
          month: { $month: "$_id" },
          day: { $dayOfMonth: "$_id" },
        },
        Total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        Total: 1,
        name: {
          $concat: [
            { $convert: { input: "$_id.year", to: "string" } },
            "-",
            { $convert: { input: "$_id.month", to: "string" } },
            "-",
            { $convert: { input: "$_id.day", to: "string" } },
          ],
        },
      },
    },
  ];
  const cSportsBets = await SportsBets.aggregate(query);
  const cGamesBets = await Games.aggregate(query);
  const cPayments = await Payments.aggregate([
    { $match: { $and: [{ status: { $ne: 0 } }, { status: { $ne: -1 } }] } },
    ...query,
  ]);
  const cLoginHistories = await LoginHistories.aggregate(query);
  const cData = [
    {
      count: cSportsBets.length,
      value: cSportsBets,
    },
    {
      count: cGamesBets.length,
      value: cGamesBets,
    },
    {
      count: cPayments.length,
      value: cPayments,
    },
    {
      count: cLoginHistories.length,
      value: cLoginHistories,
    },
  ].sort((a: any, b: any) => b.count - a.count)[0];
  const date = cData.value.map((item) => item.name);
  const charts = [] as any;
  for (const i in date) {
    const bet1 = cSportsBets.find((e) => e.name === date[i])?.Total;
    const bet2 = cGamesBets.find((e) => e.name === date[i])?.Total;
    const payment = cPayments.find((e) => e.name === date[i])?.Total;
    const login = cLoginHistories.find((e) => e.name === date[i])?.Total;
    const result = {
      bet: filter(bet1) + filter(bet2),
      payment: filter(payment),
      login: filter(login),
      name: date[i],
    };
    charts.push(result);
  }
  charts.sort(
    (a: any, b: any) => new Date(a.name).valueOf() - new Date(b.name).valueOf()
  );
  const user = await Users.findById(userId);

  const games = await Games.aggregate([
    {
      $match: {
        userId,
        createdAt,
      },
    },
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
      $group: {
        _id: {
          status: "$status",
          currency: "$currency",
        },
        amount: { $sum: "$amount" },
        profit: { $sum: "$profit" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        amount: 1,
        profit: 1,
        count: 1,
        revenue: { $subtract: ["$profit", "$amount"] },
        _id: 0,
        currency: "$_id.currency.symbol",
        order: "$_id.currency.order",
        status: "$_id.status",
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  const data1 = [] as any;
  for (const i in currencies) {
    const sportsbet = games.filter(
      (e) => e.currency === currencies[i].currency
    );
    let win = 0;
    let lost = 0;
    let refund = 0;
    let profit = 0;
    let bet = 0;
    let activebet = 0;
    let count = 0;
    for (const j in sportsbet) {
      profit += sportsbet[j].revenue;
      const status = sportsbet[j].status;
      if (status === "WIN") {
        win += sportsbet[j].profit;
      } else if (status === "LOST") {
        lost += sportsbet[j].amount - sportsbet[j].profit;
      } else if (status === "DRAW") {
        refund += sportsbet[j].amount;
      } else if (status === "BET") {
        activebet += sportsbet[j].amount;
      }
      bet += sportsbet[j].amount;
      count += sportsbet[j].count;
    }
    if (count)
      data1.push({
        icon: currencies[i].icon,
        order: currencies[i].order,
        currency: currencies[i].currency,
        price: currencies[i].price,
        count,
        win,
        lost,
        profit,
        bet,
        activebet,
        refund,
      });
  }
  data1.sort((a: any, b: any) => a.order - b.order);
  return res.json({ logined, data, charts, user, casino: data1 });
};

export const removeTest = async (req: Request, res: Response) => {
  const userId = ObjectId(req.body.userId);
  await LoginHistories.deleteMany({ userId });
  await BalanceHistories.deleteMany({ userId });
  await Payments.deleteMany({ userId });
  await BracketsBets.deleteMany({ userId });
  await Games.deleteMany({ userId });
  const sportsbets = await SportsBets.find({ userId });
  for (const i in sportsbets) {
    await SportsBets.deleteOne({ _id: sportsbets[i]._id });
    await SportsBetting.deleteMany({ betId: sportsbets[i]._id });
  }
  return res.json({ status: true });
};

export const removeSports = async (req: Request, res: Response) => {
  const userId = ObjectId(req.body.userId);
  const sportsbets = await SportsBets.find({ userId });
  for (const i in sportsbets) {
    await SportsBets.deleteOne({ _id: sportsbets[i]._id });
    await SportsBetting.deleteMany({ betId: sportsbets[i]._id });
  }
  return res.json({ status: true });
};

export const getBrackets = async (req: Request, res: Response) => {
  const result = await BracketsBets.aggregate([
    { $match: { status: "BET" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$stake" },
      },
    },
  ]);
  return res.json({ amount: result[0]?.total * 0.9 });
};

export const getCProfit = async (req: Request, res: Response) => {
  const createdAt = {
    $gte: new Date(req.body.date[0]),
    $lte: new Date(req.body.date[1]),
  };
  const result1 = await SportsBets.aggregate([
    {
      $match: { $or: [{ status: "WIN" }, { status: "HALF_WIN" }], createdAt },
    },
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
      $group: {
        _id: {
          year: { $year: "$_id" },
          month: { $month: "$_id" },
          day: { $dayOfMonth: "$_id" },
        },
        total: { $sum: 1 },
        profit: {
          $sum: {
            $subtract: [
              { $multiply: ["$stake", "$currency.price"] },
              { $multiply: ["$profit", "$currency.price"] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        profit: 1,
        name: {
          $concat: [
            { $convert: { input: "$_id.year", to: "string" } },
            "-",
            { $convert: { input: "$_id.month", to: "string" } },
            "-",
            { $convert: { input: "$_id.day", to: "string" } },
          ],
        },
      },
    },
  ]);
  const result2 = await SportsBets.aggregate([
    {
      $match: { $or: [{ status: "LOST" }, { status: "HALF_LOST" }] },
    },
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
      $group: {
        _id: {
          year: { $year: "$_id" },
          month: { $month: "$_id" },
          day: { $dayOfMonth: "$_id" },
        },
        total: { $sum: 1 },
        profit: {
          $sum: {
            $multiply: ["$profit", "$currency.price"],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        profit: 1,
        name: {
          $concat: [
            { $convert: { input: "$_id.year", to: "string" } },
            "-",
            { $convert: { input: "$_id.month", to: "string" } },
            "-",
            { $convert: { input: "$_id.day", to: "string" } },
          ],
        },
      },
    },
  ]);
  const result3 = await Games.aggregate([
    {
      $match: { $or: [{ status: "LOST" }, { status: "WIN" }] },
    },
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
      $group: {
        _id: {
          year: { $year: "$_id" },
          month: { $month: "$_id" },
          day: { $dayOfMonth: "$_id" },
        },
        total: { $sum: 1 },
        profit: {
          $sum: {
            $subtract: [
              { $multiply: ["$amount", "$currency.price"] },
              { $multiply: ["$profit", "$currency.price"] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        profit: 1,
        name: {
          $concat: [
            { $convert: { input: "$_id.year", to: "string" } },
            "-",
            { $convert: { input: "$_id.month", to: "string" } },
            "-",
            { $convert: { input: "$_id.day", to: "string" } },
          ],
        },
      },
    },
  ]);
  const dates = getDates(createdAt.$gte, createdAt.$lte);
  const result = [] as any;
  for (const key in dates) {
    const date = moment(dates[key]).format("YYYY-M-D");
    const win = result1.find((e) => e.name === date);
    const lost = result2.find((e) => e.name === date);
    const profits = result3.find((e) => e.name === date);
    if (win || lost || profits) {
      const total =
        (win?.total ? win.total : 0) + (lost?.total ? lost.total : 0);
      const profit =
        (win?.profit ? win.profit : 0) +
        (lost?.profit ? lost.profit * -1 : 0) +
        (profits?.profit ? profits.profit : 0);
      result.push({ total, profit, date, win, lost });
    }
  }
  return res.json(result);
};
