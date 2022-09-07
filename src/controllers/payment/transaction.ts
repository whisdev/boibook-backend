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

const param = process.env.MODE === "dev" ? "testnet" : "mainnet-beta";
const connection = new Connection(clusterApiUrl(param));
const URL = clusterApiUrl(param);

const PRIVKEY: any = process.env.PRIVKEY;
const txWallet = Keypair.fromSecretKey(bs58.decode(PRIVKEY));

export const getTxnResult = async (signature: string) => {
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
  return res;
};

export const transferSOL = async (amount: any, destAddress: any) => {
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
