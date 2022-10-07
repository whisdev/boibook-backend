import * as moment from "moment-timezone";
import { Request, Response } from "express";

import * as SolanaWeb3 from "@solana/web3.js";

import {
  transferToken,
  transferSOL,
  getTxnResult,
  getSOLbalance,
} from "./transaction";
import { Balances, Currencies, Payments } from "../../models";
import { balanceUpdate, ObjectId } from "../base";
import request = require("request");

export const ADMINPUB: string = "8Myhky6nWVJFeNkcBH3FE9i29KqV4qsD8reook3AUqYk";
export const WFEE: number = Number(0.0125 || process.env.WFEE);

export const deposit = async (req: Request, res: Response) => {
  const { userId, balanceId, currencyId } = req.body;
  if (!userId || !balanceId || !currencyId) {
    return res.status(400).json("Invalid field!");
  }
  const currency: any = await Currencies.findById(ObjectId(currencyId));
  if (!currency) {
    return res.status(400).json("Invalid field!");
  } else if (!currency.deposit) {
    return res.status(400).json("Deposit disabled!");
  }
  const balance = await Balances.findOne({
    userId: ObjectId(userId),
    _id: ObjectId(balanceId),
    currency: ObjectId(currencyId),
  });
  if (!balance) {
    return res.status(400).json("Invalid field!");
  }
  const payment = await Payments.create({
    userId,
    balanceId,
    currencyId: currency._id,
    currency: currency.payment,
    status: 0,
    method: 1,
    ipn_type: "deposit",
    status_text: "pending",
  });
  try {
    // const result = await client.getCallbackAddress({
    //   currency: currency.payment,
    //   label: String(payment._id),
    //   ipn_url,
    // });
    // return res.json(result);
  } catch (error: any) {
    await Payments.deleteOne({ _id: payment._id });
    if (error.code === "ENOTFOUND") {
      return res.status(400).json("Server error!");
    } else {
      return res.status(400).json(error.extra.data.error);
    }
  }
};

export const depositSolana = async (req: Request, res: Response) => {
  const {
    userId,
    balanceId,
    currencyId,
    signature,
    amount,
    address,
    from,
  } = req.body;
  const currency: any = await Currencies.findById(currencyId);
  const balances = await Balances.findOne({
    userId: ObjectId(userId),
    _id: ObjectId(balanceId),
    currency: ObjectId(currencyId),
  });
  if (!balances) {
    return res.status(400).json("Invalid field!");
  }
  const result = await Payments.findOne({ signature });
  if (result) return res.json({});
  const payment: any = await Payments.findOneAndUpdate(
    { signature },
    {
      userId,
      balanceId,
      currencyId: currencyId,
      currency: currency.payment,
      amount,
      address,
      status: 1,
      method: 0,
      ipn_type: "deposit",
      status_text: "deposited",
      signature,
    },
    { upsert: true, new: true }
  );
  res.json(payment);
  let timeout = 0;
  let timer = null as any;
  async function timerfunc() {
    const paymentResult: any = await Payments.findById(ObjectId(payment._id));
    if (paymentResult.status === 100 || paymentResult.status === -1) {
      return clearTimeout(timer);
    } else {
      const res = await getTxnResult(signature);
      if (!res.status) {
        await Payments.updateOne(
          { _id: payment._id },
          { status: -1, status_text: "canceled" }
        );
        return clearTimeout(timer);
      } else {
        var tResult = res.data.result;
        if (tResult) {
          if (
            tResult.transaction.message.accountKeys[2] ==
            "11111111111111111111111111111111"
          ) {
            const realamount =
              (tResult.meta.preBalances[0] -
                tResult.meta.postBalances[0] -
                tResult.meta.fee) /
              SolanaWeb3.LAMPORTS_PER_SOL;

            const fromAcc = tResult.transaction.message.accountKeys[0].toLowerCase();
            const receiverAcc = tResult.transaction.message.accountKeys[1].toLowerCase();

            if ((from.toLowerCase() == fromAcc ||
              from.toLowerCase() == receiverAcc) &&
              (ADMINPUB.toLowerCase() == fromAcc ||
                ADMINPUB.toLowerCase() == receiverAcc)
            ) {
              await Payments.findByIdAndUpdate(
                ObjectId(payment._id),
                { status: 100, status_text: "confirmed", amount: realamount },
                { new: true }
              );
              await balanceUpdate({
                req,
                balanceId,
                amount: realamount,
                type: "deposit-solana",
              });
              return clearTimeout(timer);
            } else {
              return clearTimeout(timer);
            }
          } else {
            const preTokenB = tResult.meta.preTokenBalances;
            const postTokenB = tResult.meta.postTokenBalances;
            const realamount = Math.abs(
              preTokenB[0].uiTokenAmount.uiAmount -
              postTokenB[0].uiTokenAmount.uiAmount
            );
            const fromAcc = preTokenB[0].owner.toLowerCase();
            const tokenMintAcc = preTokenB[0].mint.toLowerCase();
            const receiverAcc = postTokenB[1].owner.toLowerCase();
            if ((from.toLowerCase() == fromAcc ||
              from.toLowerCase() == receiverAcc) &&
              address.toLowerCase() == tokenMintAcc &&
              (ADMINPUB.toLowerCase() == fromAcc ||
                ADMINPUB.toLowerCase() == receiverAcc)
            ) {
              await Payments.findByIdAndUpdate(
                ObjectId(payment._id),
                { status: 100, status_text: "confirmed", amount: realamount },
                { new: true }
              );
              await balanceUpdate({
                req,
                balanceId,
                amount: realamount,
                type: "deposit-solana",
              });
              return clearTimeout(timer);
            } else {
              return clearTimeout(timer);
            }
          }
        }
      }
    }
    timeout++;
    timer = setTimeout(timerfunc, 10000);
    if (timeout === 360) {
      return clearTimeout(timer);
    }
  }
  timer = setTimeout(timerfunc, 10000);
};

export const withdrawal = async (req: Request, res: Response) => {
  const { userId, balanceId, currencyId, address, amount, method } = req.body;
  const currency = await Currencies.findById(ObjectId(currencyId));
  if (!currency) {
    return res.status(400).json("Invalid field!");
  } else if (!currency.withdrawal) {
    return res.status(400).json("Withdrawal disabled!");
  }
  const _balance: any = await Balances.findOne({
    userId: ObjectId(userId),
    _id: ObjectId(balanceId),
    currency: ObjectId(currencyId),
  });
  if (!_balance || _balance.balance <= 0 || _balance.balance < Number(amount)) {
    return res.status(400).json("Your balance is not enough!");
  }
  const type = method === 0 ? "withdrawal-metamask" : "withdrawal-coinpayment";
  await balanceUpdate({ req, balanceId, amount: amount * -1, type });
  await Payments.create({
    userId,
    balanceId,
    currencyId: currency._id,
    currency: currency.symbol,
    amount,
    address,
    method,
    status: -2,
    status_text: "pending",
    ipn_type: "withdrawal",
  });
  return res.json("Succeed!");
};

export const cancelWithdrawal = async (req: Request, res: Response) => {
  const { _id } = req.body;
  const payment: any = await Payments.findOneAndUpdate(
    { _id: ObjectId(_id) },
    { status: -1, status_text: "canceled" }
  );
  await balanceUpdate({
    req,
    balanceId: payment.balanceId,
    amount: payment.amount,
    type: "withdrawal-solana-canceled",
  });
  return res.json(true);
};

export const getTransactions = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await Payments.find({
    userId: ObjectId(userId),
    status: { $ne: 0 },
  })
    .populate("currencyId")
    .sort({ createdAt: -1 });
  return res.json(result);
};

export const getCurrencies = async (req: Request, res: Response) => {
  const result = await Currencies.find({ status: true }).sort({
    order: 1,
    createdAt: 1,
  });
  return res.json(result);
};

export const getBalances = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await Balances.find({
    userId: ObjectId(userId),
    disabled: false,
  }).sort({ status: -1, balance: -1 });
  return res.json(result);
};

export const addRemoveCurrency = async (req: Request, res: Response) => {
  const userId = ObjectId(req.body.userId);
  const currency = ObjectId(req.body.currency);
  const data = await Balances.findOne({ userId, currency });
  if (data) {
    const result = await Balances.findOneAndUpdate(
      { userId, currency },
      { disabled: !data.disabled, status: false },
      { new: true }
    );
    const count = await Balances.countDocuments({
      userId,
      disabled: false,
      status: true,
    });
    if (count === 0) {
      await Balances.findOneAndUpdate(
        { userId, disabled: false },
        { status: true }
      );
    }
    return res.json(result);
  } else {
    const result = await Balances.create({
      userId,
      currency,
      balance: 0,
      status: false,
      disabled: false,
    });
    return res.json(result);
  }
};

export const useCurrency = async (req: Request, res: Response) => {
  const { userId, currency } = req.body;
  await Balances.updateMany({ userId: ObjectId(userId) }, { status: false });
  const result = await Balances.findOneAndUpdate(
    { userId: ObjectId(userId), currency: ObjectId(currency) },
    { status: true }
  );
  return res.json(result);
};

export const UpdatePrices = async () => {
  const currencies = await Currencies.find({ coingecko: { $ne: "" } }).select({
    coingecko: 1,
    _id: 0,
  });
  const ids = currencies.map((e) => e.coingecko);
  const id_count = 4;
  let pages = Math.ceil(ids.length / id_count);
  let sendIds = [] as any;
  for (let i = 0; i < pages; i++) {
    let id = [] as any;
    if (i === 0) {
      id = ids.slice(0, i + 1 * id_count);
    } else {
      id = ids.slice(i * id_count, (i + 1) * id_count);
    }
    sendIds.push(id.join(","));
  }
  for (let i in sendIds) {
    setTimeout(() => {
      const option1 = {
        method: "GET",
        url: process.env.GET_PRICE_URL as string,
        headers: { "Content-Type": "application/json" },
        qs: {
          ids: sendIds[i],
          vs_currencies: "usd",
        },
        json: true,
      };
      request(option1, async (error, response, body) => {
        if (!error) {
          for (const i in body) {
            if (i)
              await Currencies.updateOne(
                { coingecko: i },
                { price: body[i].usd }
              );
          }
        }
      });
    }, 1000);
  }
};

export const updateBalance = async (req: Request, res: Response) => {
  const { balanceId, amount, type } = req.body;
  const balances: any = await Balances.findById(ObjectId(balanceId));
  if (type === "withdrawal" && balances.balance < amount) {
    return res.status(400).json("Balances not enough!");
  }
  if (type === "withdrawal") {
    await balanceUpdate({
      req,
      balanceId,
      amount: amount * -1,
      type: `${type}-admin`,
    });
    await Payments.create({
      currencyId: balances.currency._id,
      currency: balances.currency.symbol,
      userId: balances.userId,
      balanceId,
      amount,
      address: "admin",
      status: 2,
      method: 3,
      ipn_type: type,
      status_text: "confirmed",
      signature: "admin",
    });
  } else {
    await balanceUpdate({ req, balanceId, amount, type: `${type}-admin` });
    await Payments.create({
      currencyId: balances.currency._id,
      currency: balances.currency.symbol,
      userId: balances.userId,
      balanceId,
      amount,
      address: "admin",
      status: 100,
      method: 3,
      ipn_type: type,
      status_text: "confirmed",
      signature: "admin",
    });
  }
  return res.json({ status: true });
};

export const getAdminBalance = async (req: Request, res: Response) => {
  let solana: any = {};
  const currencies = await Currencies.find({ status: true }).select({
    _id: 0,
    symbol: 1,
    tokenMintAccount: 1,
    price: 1,
    icon: 1,
  });
  let total = 0;

  for (const i in currencies) {
    const currency: any = currencies[i];
    const balance = await getSOLbalance(ADMINPUB, currency);
    const usdbalance = balance * currency.price;
    solana[currency.symbol] = {
      usdbalance,
      balance,
    };
    total += usdbalance;
  }

  return res.json({
    solana,
    total,
  });
};

export const withdrawalTimer = async () => {
  const processingPayment: any = await Payments.findOne({
    method: 1,
    status: 1,
    ipn_type: "withdrawal",
  });
  if (processingPayment) {
    const res = await getTxnResult(processingPayment.signature);
    if (!res) return;
    if (!res.status) {
      await Payments.updateOne(
        { _id: processingPayment._id },
        { status: -1, status_text: "canceled" }
      );
      await balanceUpdate({
        balanceId: processingPayment.balanceId,
        amount: processingPayment.amount,
        type: "withdrawal-solana-canceled",
      });
    } else {
      await Payments.updateOne(
        { _id: processingPayment._id },
        { status: 2, status_text: "confirmed" }
      );
    }
  }
  const pendingPayment: any = await Payments.findOne({
    method: 1,
    status: 105,
    ipn_type: "withdrawal",
  })
    .populate("currencyId")
    .sort({ createdAt: 1 });
  if (pendingPayment) {
    const currency: any = pendingPayment.currencyId;
    const balance: any = await Balances.findById(pendingPayment.balanceId);
    if (balance.balance < 0) {
      console.log("error =>", balance);
      return await Payments.updateOne(
        { _id: pendingPayment._id },
        { status: -1, status_text: "canceled" }
      );
    }
    try {
      let signature: any;
      if (currency.symbol == "SOL") {
        signature = await transferSOL(
          pendingPayment.amount,
          // pendingPayment.amount * (1 - WFEE),
          pendingPayment.address
        );
      } else {
        signature = await transferToken(
          currency.tokenMintAccount,
          pendingPayment.amount,
          // pendingPayment.amount * (1 - WFEE),
          pendingPayment.address
        );
      }
      if (signature === false) {
        await Payments.updateOne(
          { _id: pendingPayment._id },
          { status: -1, status_text: "canceled" }
        );
      } else {
        await Payments.updateOne(
          { _id: pendingPayment._id },
          { status: 1, status_text: "processing", signature }
        );
      }
    } catch (error) {
      console.log("payment error => ", error);
    }
  }
};

export const removePendingPayment = async () => {
  const date = moment().subtract(24, "hours");
  await Payments.find({
    ipn_type: "deposit",
    status: 0,
    method: 1,
    createdAt: { $lte: date },
  });
};

export const getPaymentMethod = async (req: Request, res: Response) => {
  const result = await Currencies.find({ status: true })
    .sort({ order: 1 })
    .select({
      _id: 0,
      icon: 1,
      name: 1,
      officialLink: 1,
    });
  return res.json(result);
};
