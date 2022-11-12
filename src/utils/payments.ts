import { Connection } from "@solana/web3.js";

const Web3 = require("web3");

export const solanaRPCurls = () => {
  return [
    // "https://api.mainnet-beta.solana.com",
    // "https://solana-api.projectserum.com",
    // "https://rpc.ankr.com/solana",
    "https://hidden-wandering-aura.solana-mainnet.quiknode.pro/e0a0b8715ea82e2abccff89f6ceed40bd68f9875/",
  ];
};

export const getSolanaRPCurl = () => {
  // const rpcurls = solanaRPCurls();
  return "https://hidden-wandering-aura.solana-mainnet.quiknode.pro/e0a0b8715ea82e2abccff89f6ceed40bd68f9875/";
};

export const getSolanaConnection = () => {
  const connection = new Connection(getSolanaRPCurl());
  return connection;
};

export const etherRPCurls = () => {
  return [
    "https://ethereum.publicnode.com",
    "https://rpc.ankr.com/eth",
    "https://eth-rpc.gateway.pokt.network",
  ];
};

export const getEtherRPCurl = () => {
  const rpcurls = etherRPCurls();
  return rpcurls[Math.floor(Math.random() * 3)];
};

export const binanceRPCurls = () => {
  return [
    "https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
    "https://binance.nodereal.io",
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed4.binance.org",
    // "https://bsc-testnet.public.blastapi.io",
    // "https://bsctestapi.terminet.io/rpc",
    // "https://data-seed-prebsc-1-s2.binance.org:8545",
    // "https://data-seed-prebsc-2-s2.binance.org:8545",
  ];
};

export const getBinanceRPCurl = () => {
  const rpcurls = binanceRPCurls();
  return rpcurls[Math.floor(Math.random() * 3)];
};
