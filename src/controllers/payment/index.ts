import Coinpayments from "coinpayments";
import * as request from "request";
import * as moment from "moment-timezone";
import { Request, Response } from "express";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { Transaction as EthereumTx } from "ethereumjs-tx";

import axios from "axios";
import * as SolanaWeb3 from "@solana/web3.js";

import { Balances, Currencies, Payments } from "../../models";
import { balanceUpdate, decrypt, NumberFix, ObjectId } from "../base";
const Web3 = require("web3");
const IPN = require("coinpayments-ipn");

const ipn_url = `${
  process.env.MODE === "dev" ? process.env.DEV_API_URL : process.env.API_URL
}${process.env.IPN_URL}`;
const adminAddress = process.env.PUBLIC_ADDRESS as string;

// const CoinpaymentsCredentials = {
//   key: process.env.PUBLIC_KEY as string,
//   secret: decrypt(process.env.PRIVATE_KEY as string),
// };
// const client = new Coinpayments(CoinpaymentsCredentials);

export const web3 = new Web3(process.env.WEB3_URL as string);

const transferErc20 = async (
  senders: string,
  reciever: string,
  contractInfo: any,
  amount: string
) => {
  return new Promise(async (resolve, reject) => {
    const contract = new web3.eth.Contract(
      contractInfo.abi,
      contractInfo.address,
      { from: senders }
    );
    const decimals = await contract.methods.decimals().call();
    const amounti = parseUnits(String(amount), decimals);
    const balance = await contract.methods.balanceOf(senders).call();
    if (Number(formatUnits(balance, decimals)) < Number(amount)) {
      return reject("Insufficient funds!");
    } else {
      const nonce = await web3.eth.getTransactionCount(senders);
      const gasLimit = await contract.methods
        .transfer(reciever, amounti)
        .estimateGas({ from: senders });
      const gasPrice = await web3.eth.getGasPrice();
      const transactionFee = Number(gasPrice) * gasLimit;
      const transactionFeeAmount = web3.utils.fromWei(
        String(transactionFee),
        "ether"
      );
      const ether: any = await Currencies.findOne({ contractAddress: "ether" });
      const etherFee = ether.price * Number(transactionFeeAmount) * 1.5;
      const erc20Amount =
        (contractInfo.price * Number(amount) - etherFee) / contractInfo.price;
      if (erc20Amount < 0) return reject("Insufficient transaction fee.");
      const erc20Amounti = parseUnits(
        Number(erc20Amount.toFixed(decimals)).toString(),
        decimals
      );
      const transactionObject = {
        from: senders,
        nonce,
        gasPrice: Number(gasPrice),
        gasLimit: 400000,
        to: contractInfo.address,
        data: contract.methods.transfer(reciever, erc20Amounti).encodeABI(),
      };
      const privKey = Buffer.from(
        decrypt(process.env.PRIVATE_ADDRESS as string),
        "hex"
      );
      const transaction = new EthereumTx(transactionObject, {
        chain: "mainnet",
      });
      transaction.sign(privKey);
      const serializedTransaction = `0x${transaction
        .serialize()
        .toString("hex")}`;
      web3.eth.sendSignedTransaction(
        serializedTransaction,
        (error: any, signature: string) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(signature);
          }
        }
      );
    }
  });
};

const transferEthererum = async (
  senders: string,
  reciever: string,
  amount: string
) => {
  return new Promise(async (resolve, reject) => {
    const nonce = await web3.eth.getTransactionCount(senders);
    web3.eth.getBalance(senders, async (error: any, result: any) => {
      if (error) {
        return reject();
      }
      const balance = web3.utils.fromWei(result, "ether");
      if (Number(balance) < Number(amount) + 0.1) {
        return reject("Insufficient funds!");
      } else {
        const gasPrice = await web3.eth.getGasPrice();
        const sendAmount = web3.utils.toHex(
          web3.utils.toWei(String(amount), "ether")
        );
        let transactionObject = {
          to: reciever,
          gasPrice,
          nonce: nonce,
        } as any;
        const gasLimit = await web3.eth.estimateGas(transactionObject);
        const transactionFee = Number(gasPrice) * gasLimit * 1.5;
        transactionObject.gas = gasLimit;
        transactionObject.value = Number(sendAmount) - transactionFee;
        if (Number(sendAmount) - transactionFee < 0)
          return reject("Insufficient transaction fee.");
        const transaction = new EthereumTx(transactionObject, {
          chain: "mainnet",
        });
        const privKey = Buffer.from(
          decrypt(process.env.PRIVATE_ADDRESS as string),
          "hex"
        );
        transaction.sign(privKey);
        const serializedTransaction = `0x${transaction
          .serialize()
          .toString("hex")}`;
        web3.eth.sendSignedTransaction(
          serializedTransaction,
          (error: any, signature: string) => {
            if (error) {
              return reject(error);
            } else {
              return resolve(signature);
            }
          }
        );
      }
    });
  });
};

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
    amounti,
    address,
    receiver,
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
  // const result = await Payments.findOne({ signature });
  // if (result) return res.json({});
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
      // you can also pass 'devnet' or 'testnet'
      const param = process.env.MODE === "dev" ? "testnet" : "mainnet-beta";
      const URL = SolanaWeb3.clusterApiUrl(param);
      const res = await axios(URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        data: {
          jsonrpc: "2.0",
          id: "get-transaction",
          method: "getTransaction",
          params: [signature],
        },
      });
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
            var sendAmount =
              (tResult.meta.preBalances[0] -
                tResult.meta.postBalances[0] -
                tResult.meta.fee) /
              SolanaWeb3.LAMPORTS_PER_SOL;
            if (
              amounti == sendAmount &&
              from.toLowerCase() ==
                tResult.transaction.message.accountKeys[0].toLowerCase() &&
              receiver.toLowerCase() ==
                tResult.transaction.message.accountKeys[1].toLowerCase()
            ) {
              await Payments.findByIdAndUpdate(
                ObjectId(payment._id),
                { status: 100, status_text: "confirmed" },
                { new: true }
              );
              await balanceUpdate({
                req,
                balanceId,
                amount,
                type: "deposit-solana",
              });
              return clearTimeout(timer);
            } else {
              return clearTimeout(timer);
            }
          } else {
            var sendAmount =
              (Number(tResult.meta.postTokenBalances[0].uiTokenAmount.amount) -
                Number(tResult.meta.preTokenBalances[0].uiTokenAmount.amount)) /
              SolanaWeb3.LAMPORTS_PER_SOL;
            if (
              amounti == sendAmount &&
              from.toLowerCase() ==
                tResult.meta.postTokenBalances[1].owner.toLowerCase() &&
              address.toLowerCase() ==
                tResult.meta.postTokenBalances[0].mint.toLowerCase() &&
              receiver.toLowerCase() ==
                tResult.meta.postTokenBalances[0].owner.toLowerCase()
            ) {
              await Payments.findByIdAndUpdate(
                ObjectId(payment._id),
                { status: 100, status_text: "confirmed" },
                { new: true }
              );
              await balanceUpdate({
                req,
                balanceId,
                amount,
                type: "deposit-metamask",
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
    type: "withdrawal-metamask-canceled",
  });
  return res.json(true);
};

export const getTransactionResult = async (req: Request, res: Response) => {
  if (
    !req.get(`hmac`) ||
    !req.body ||
    !req.body.ipn_mode ||
    req.body.ipn_mode !== `hmac` ||
    process.env.MERCHANT_ID !== req.body.merchant
  ) {
    return res.send("error");
  }
  const hmac = req.get(`hmac`);
  const ipnSecret = process.env.IPN_SECRET;
  const payload = req.body;
  let isValid;
  try {
    isValid = IPN.verify(hmac, ipnSecret, payload);
  } catch (e) {
    return res.send("error");
  }
  if (!payload?.amount) return console.log(payload);
  if (isValid) {
    try {
      const {
        label,
        address,
        amount,
        amounti,
        currency,
        ipn_id,
        ipn_mode,
        ipn_type,
        merchant,
        status,
        status_text,
        signature,
      } = payload;
      let data = {
        address,
        amount,
        amounti,
        currency,
        ipn_id,
        ipn_mode,
        ipn_type,
        merchant,
        status,
        status_text,
        signature,
      } as any;
      if (NumberFix(amount, 5) === 0) return;
      if (ipn_type === "deposit") {
        if (!amount || !payload.fee) return console.log(`fee`, payload);
        data.id = payload.deposit_id;
        data.amount = amount - payload.fee;
        data.status_text = status === "100" ? "confirmed" : data.status_text;
        const result: any = await Payments.findOne({ _id: ObjectId(label) });
        if (result && result.status !== 100) {
          await Payments.updateOne({ _id: ObjectId(label) }, data);
          if (status === "100") {
            balanceUpdate({
              req,
              balanceId: result.balanceId,
              amount: amount - payload.fee,
              type: "deposit-coinpayment",
            });
          }
        }
      } else if (ipn_type === "withdrawal") {
        data.id = payload.id;
        if (status === "2") {
          data.status_text = "confirmed";
        } else if (status === "-1") {
          data.status_text = "canceled";
        } else if (status === "-6") {
          data.status_text = "canceled";
        } else {
          console.log(data.status_text);
        }
        const result = await Payments.findOne({ id: payload.id });
        if (result && result.status !== 2) {
          await Payments.updateOne({ id: payload.id }, data);
        }
      } else {
        console.log("isValid deposit withdrawal error");
      }
    } catch (error) {
      console.log("isValid", error);
      return res.json(error);
    }
  } else {
    console.log("hmac error");
  }
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

// export const UpdatePrices = async () => {
//   const currencies = await Currencies.find({ coingecko: { $ne: "" } }).select({
//     coingecko: 1,
//     _id: 0,
//   });
//   const ids = currencies.map((e) => e.coingecko);
//   const id_count = 4;
//   let pages = Math.ceil(ids.length / id_count);
//   let sendIds = [] as any;
//   for (let i = 0; i < pages; i++) {
//     let id = [] as any;
//     if (i === 0) {
//       id = ids.slice(0, i + 1 * id_count);
//     } else {
//       id = ids.slice(i * id_count, (i + 1) * id_count);
//     }
//     sendIds.push(id.join(","));
//   }
//   for (let i in sendIds) {
//     setTimeout(() => {
//       const option1 = {
//         method: "GET",
//         url: process.env.GET_PRICE_URL as string,
//         headers: { "Content-Type": "application/json" },
//         qs: {
//           ids: sendIds[i],
//           vs_currencies: "usd",
//         },
//         json: true,
//       };
//       request(option1, async (error, response, body) => {
//         if (!error) {
//           for (const i in body) {
//             if (i)
//               await Currencies.updateOne(
//                 { coingecko: i },
//                 { price: body[i].usd }
//               );
//           }
//         }
//       });
//     }, 1000);
//   }
// };

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
  const address1 = "0xe197bD957B08D07E55D65A362780C7845b2CbA12";
  const address2 = process.env.PUBLIC_ADDRESS as string;
  let balances;
  try {
    // balances = await client.balances();
  } catch (error) {
    console.log(error);
  }
  const currencies = await Currencies.find({ status: true }).select({
    _id: 0,
    abi: 1,
    symbol: 1,
    price: 1,
    contractAddress: 1,
    type: 1,
    payment: 1,
    icon: 1,
  });
  let metamask = {} as any;
  let coinpayment = {} as any;
  let mtotal1 = 0;
  let mtotal2 = 0;
  let ctotal = 0;
  for (const i in currencies) {
    const currency: any = currencies[i];
    if (currency.type === 2 || currency.type === 0) {
      if (currency.contractAddress !== "ether") {
        const contract = new web3.eth.Contract(
          currency.abi,
          currency.contractAddress
        );
        const balance1 = await contract.methods.balanceOf(address1).call();
        const balance2 = await contract.methods.balanceOf(address2).call();
        const decimals = await contract.methods.decimals().call();
        const amount1 = Number(formatUnits(balance1, decimals));
        const amount2 = Number(formatUnits(balance2, decimals));
        metamask[currency.symbol] = {
          balance1: amount1,
          balance2: amount2,
          usdbalance1: amount1 * currency.price,
          usdbalance2: amount2 * currency.price,
        };
        mtotal1 += amount1 * currency.price;
        mtotal2 += amount2 * currency.price;
      } else {
        const balance1 = await web3.eth.getBalance(address1);
        const balance2 = await web3.eth.getBalance(address2);
        const amount1 = Number(formatUnits(balance1, 18));
        const amount2 = Number(formatUnits(balance2, 18));
        metamask[currency.symbol] = {
          balance1: amount1,
          balance2: amount2,
          usdbalance1: amount1 * currency.price,
          usdbalance2: amount2 * currency.price,
        };
        mtotal1 += amount1 * currency.price;
        mtotal2 += amount2 * currency.price;
      }
    }
    if (balances) {
      // const balance = balances[currency.payment];
      // if (balance) {
      //   coinpayment[currency.symbol] = {
      //     balance: Number(balance.balancef),
      //     usdbalance: Number(balance.balancef) * currency.price,
      //   };
      //   ctotal += Number(balance.balancef) * currency.price;
      // }
    }
  }
  return res.json({ metamask, coinpayment, ctotal, mtotal1, mtotal2 });
};

export const withdrawalTimer = async () => {
  console.log('withdraw timer');
  const processingPayment: any = await Payments.findOne({
    method: 0,
    status: 1,
    ipn_type: "withdrawal",
  });
  console.log(processingPayment);
  if (processingPayment) {
    const response = await web3.eth.getTransactionReceipt(
      processingPayment.signature
    );
    if (!response) return;
    if (!response.status) {
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
  } else {
    const pendingPayment: any = await Payments.findOne({
      method: 0,
      status: 105,
      ipn_type: "withdrawal",
    })
      .populate("currencyId")
      .sort({ createdAt: 1 });
    console.log(pendingPayment);
    if (!pendingPayment || !pendingPayment.currencyId) {
    } else {
      const balance: any = await Balances.findById(pendingPayment.balanceId);
      console.log(balance);
      if (balance.balance < 0) {
        console.log("error =>", balance);
        await Payments.updateOne(
          { _id: pendingPayment._id },
          { status: -1, status_text: "canceled" }
        );
      } else {
        const currency: any = pendingPayment.currencyId;
        console.log(currency);
        if (currency.symbol === "ETH") {
          transferEthererum(
            adminAddress,
            pendingPayment.address,
            pendingPayment.amount
          )
            .then(async (signature) => {
              await Payments.updateOne(
                { _id: pendingPayment._id },
                {
                  status: 1,
                  status_text: "processing",
                  id: signature,
                  signature,
                }
              );
            })
            .catch((error) => {
              console.log("error", error);
            });
        } else {
          const currencyData = {
            abi: currency.abi,
            address: currency.contractAddress,
            price: currency.price,
          };
          transferErc20(
            adminAddress,
            pendingPayment.address,
            currencyData,
            pendingPayment.amount
          )
            .then(async (signature) => {
              await Payments.updateOne(
                { _id: pendingPayment._id },
                {
                  status: 1,
                  status_text: "processing",
                  id: signature,
                  signature,
                }
              );
            })
            .catch((error) => {
              console.log("error", error);
            });
        }
      }
    }
  }
  const pendingPayment = await Payments.findOne({
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
      const Opts: any = {
        amount: pendingPayment.amount,
        currency: currency.payment,
        ipn_url,
        address: pendingPayment.address,
      };
      // const data = await client.createWithdrawal(Opts);
      // await Payments.updateOne(
      //   { _id: pendingPayment._id },
      //   { id: data.id, status: data.status, status_text: "processing" }
      // );
    } catch (error) {
      console.log("coinpayment error => ", error);
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
