import {
  Keypair,
  Transaction,
  Connection,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import * as bs58 from "bs58";
import axios from "axios";
import * as SolanaWeb3 from "@solana/web3.js";
export const ADMINPUB: string = "8Myhky6nWVJFeNkcBH3FE9i29KqV4qsD8reook3AUqYk";
import { decrypt, ObjectId } from "../base";
import { Payments, Users } from "../../models";
import { getSolanaConnection, getSolanaRPCurl } from "../../utils/payments";

const param = process.env.MODE === "dev" ? "testnet" : "mainnet-beta";
const URL = clusterApiUrl(param);

const S_W_PRIVATE_ADDRESS: any = decrypt(process.env.S_W_PRIVATE_ADDRESS as string);
const txWallet = Keypair.fromSecretKey(bs58.decode(S_W_PRIVATE_ADDRESS));


export const getSolanaTxnResult = async (signature: string) => {
  try {
    const res = await axios(getSolanaRPCurl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      data: {
        jsonrpc: "2.0",
        id: "get-transaction",
        method: "getTransaction",
        params: [signature],
      },
    });
    return res;
  } catch (error) {
    console.log("=========== catch up ===========");
    console.log(error);
    return false;
  }
};

export const getPendingSolanaTxnResult = async (paymentID: string) => {
  const payment: any = await Payments.findById(ObjectId(paymentID));
  const user: any = await Users.findById(ObjectId(payment.userId));
  const res: any = await getSolanaTxnResult(payment.signature);
  let signatureFlag = "pending";
  if (res == false) {
    return {
      signatureFlag,
      status: false,
      amount: 0,
      balanceId: payment.balanceId,
    };
  } else {
    var tResult = res.data.result;
    var status = false,
      amount = 0;
    if (tResult) {
      signatureFlag = "good";
      if (
        tResult.transaction.message.accountKeys[2] ==
        "11111111111111111111111111111111"
      ) {
        const realamount =
          (tResult.meta.preBalances[0] -
            tResult.meta.postBalances[0] -
            tResult.meta.fee) /
          SolanaWeb3.LAMPORTS_PER_SOL;

        const fromAcc =
          tResult.transaction.message.accountKeys[0].toLowerCase();
        const receiverAcc =
          tResult.transaction.message.accountKeys[1].toLowerCase();

        amount = realamount;

        if (
          payment.amount == realamount &&
          (user.publicAddress.toLowerCase() == fromAcc ||
            user.publicAddress.toLowerCase() == receiverAcc) &&
          (ADMINPUB.toLowerCase() == fromAcc ||
            ADMINPUB.toLowerCase() == receiverAcc)
        ) {
          status = true;
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
        amount = realamount;
        if (
          payment.amount == realamount &&
          (user.publicAddress.toLowerCase() == fromAcc ||
            user.publicAddress.toLowerCase() == receiverAcc) &&
          payment.address.toLowerCase() == tokenMintAcc &&
          (ADMINPUB.toLowerCase() == fromAcc ||
            ADMINPUB.toLowerCase() == receiverAcc)
        ) {
          status = true;
        }
      }
    } else {
      signatureFlag = "bad";
      status = false;
    }
    return { signatureFlag, status, amount, balanceId: payment.balanceId };
  }
};

export const transferSOL = async (amount: any, destAddress: any) => {
  const connection = getSolanaConnection();
  let transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: txWallet.publicKey,
      toPubkey: new PublicKey(destAddress),
      lamports: Math.floor(Number(amount) * LAMPORTS_PER_SOL),
    })
  );
  transaction.feePayer = txWallet.publicKey;

  const txhash = await connection.sendTransaction(transaction, [txWallet]);
  console.log(`txhash: ${txhash}`);

  return txhash;
};

export const transferToken = async (
  tokenMintAddress: any,
  amount: any,
  destAddress: any
) => {
  const connection = getSolanaConnection();
  const mintPubkey = new PublicKey(tokenMintAddress);

  const destPubkey = new PublicKey(destAddress);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    txWallet,
    mintPubkey,
    txWallet.publicKey
  );

  const tokenAccountBalance = await connection.getTokenAccountBalance(
    fromTokenAccount.address
  );

  if (tokenAccountBalance) {
    const decimals = tokenAccountBalance.value.decimals;

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      txWallet,
      mintPubkey,
      destPubkey
    );

    // transfer token
    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount.address, // from
        mintPubkey, // mint
        toTokenAccount.address, // to
        txWallet.publicKey, // from's owner
        Math.floor(Number(amount) * 10 ** decimals), // amount
        decimals // decimals
      )
    );

    const txhash = await connection.sendTransaction(transaction, [txWallet]);
    console.log(`txhash: ${txhash}`);

    return txhash;
  }

  return false;
};

export const getSOLbalance = async (walletAddress: string, currency: any) => {
  const connection = getSolanaConnection();
  const ownerPubkey = new PublicKey(walletAddress);
  let tokenBalance: any;
  try {
    if (currency.symbol === "SOL") {
      tokenBalance =
        (await connection.getBalance(ownerPubkey)) / LAMPORTS_PER_SOL;
    } else {
      const mintPubkey = new PublicKey(currency.tokenMintAccount);
      const ownerTokenAccount: any = await getOrCreateAssociatedTokenAccount(
        connection,
        txWallet,
        mintPubkey,
        ownerPubkey
      );

      const tokenAccountBalance: any = await connection.getTokenAccountBalance(
        ownerTokenAccount.address
      );
      tokenBalance =
        tokenAccountBalance.value.amount /
        10 ** tokenAccountBalance.value.decimals;
    }
  } catch (error) {
    tokenBalance = 0;
  }
  return tokenBalance;
};
