import * as TYPES from "./constants";

export const invalid = (action: any, info: any) => {
  return {
    type: TYPES.INVALID,
    payload: {
      type: action.type,
      payload: action.payload,
      info: info,
    },
  };
};

export const restore = () => {
  return {
    type: TYPES.RESTORE,
  };
};

export const deal = ({ bet = 10, sideBets = { luckyLucky: 0 } }) => {
  return {
    type: TYPES.DEAL,
    payload: {
      bet,
      sideBets,
    },
  };
};

export const insurance = ({ bet = 0 }) => {
  return {
    type: TYPES.INSURANCE,
    payload: {
      bet,
    },
  };
};

export const split = () => {
  return {
    type: TYPES.SPLIT,
  };
};

export const hit = ({ position = "right" }) => {
  return {
    type: TYPES.HIT,
    payload: {
      position,
    },
  };
};

export const double = ({ position = "right" }) => {
  return {
    type: TYPES.DOUBLE,
    payload: {
      position,
    },
  };
};

export const stand = ({ position = "right" }) => {
  return {
    type: TYPES.STAND,
    payload: {
      position,
    },
  };
};

export const surrender = () => {
  return {
    type: TYPES.SURRENDER,
  };
};

export const showdown = ({ dealerHoleCardOnly = false }) => {
  return {
    type: TYPES.SHOWDOWN,
    payload: {
      dealerHoleCardOnly,
    },
  };
};

export const dealerHit = ({
  dealerHoleCard,
}: { dealerHoleCard?: any } = {}) => {
  return {
    type: TYPES.DEALER_HIT,
    payload: {
      dealerHoleCard,
    },
  };
};

export const deck = [
  {
    index: 1,
    type: "spades",
    value: "A",
    rank: 0,
    slot: 1,
    blackjackValue: 11,
  },
  { index: 2, type: "spades", value: "2", rank: 1, slot: 2, blackjackValue: 2 },
  { index: 3, type: "spades", value: "3", rank: 2, slot: 3, blackjackValue: 3 },
  { index: 4, type: "spades", value: "4", rank: 3, slot: 4, blackjackValue: 4 },
  { index: 5, type: "spades", value: "5", rank: 4, slot: 5, blackjackValue: 5 },
  { index: 6, type: "spades", value: "6", rank: 5, slot: 6, blackjackValue: 6 },
  { index: 7, type: "spades", value: "7", rank: 6, slot: 7, blackjackValue: 7 },
  { index: 8, type: "spades", value: "8", rank: 7, slot: 8, blackjackValue: 8 },
  { index: 9, type: "spades", value: "9", rank: 8, slot: 9, blackjackValue: 9 },
  {
    index: 10,
    type: "spades",
    value: "10",
    rank: 9,
    slot: 10,
    blackjackValue: 10,
  },
  {
    index: 11,
    type: "spades",
    value: "J",
    rank: 10,
    slot: 11,
    blackjackValue: 10,
  },
  {
    index: 12,
    type: "spades",
    value: "Q",
    rank: 11,
    slot: 12,
    blackjackValue: 10,
  },
  {
    index: 13,
    type: "spades",
    value: "K",
    rank: 12,
    slot: 13,
    blackjackValue: 10,
  },
  {
    index: 14,
    type: "hearts",
    value: "A",
    rank: 0,
    slot: 1,
    blackjackValue: 11,
  },
  {
    index: 15,
    type: "hearts",
    value: "2",
    rank: 1,
    slot: 2,
    blackjackValue: 2,
  },
  {
    index: 16,
    type: "hearts",
    value: "3",
    rank: 2,
    slot: 3,
    blackjackValue: 3,
  },
  {
    index: 17,
    type: "hearts",
    value: "4",
    rank: 3,
    slot: 4,
    blackjackValue: 4,
  },
  {
    index: 18,
    type: "hearts",
    value: "5",
    rank: 4,
    slot: 5,
    blackjackValue: 5,
  },
  {
    index: 19,
    type: "hearts",
    value: "6",
    rank: 5,
    slot: 6,
    blackjackValue: 6,
  },
  {
    index: 20,
    type: "hearts",
    value: "7",
    rank: 6,
    slot: 7,
    blackjackValue: 7,
  },
  {
    index: 21,
    type: "hearts",
    value: "8",
    rank: 7,
    slot: 8,
    blackjackValue: 8,
  },
  {
    index: 22,
    type: "hearts",
    value: "9",
    rank: 8,
    slot: 9,
    blackjackValue: 9,
  },
  {
    index: 23,
    type: "hearts",
    value: "10",
    rank: 9,
    slot: 10,
    blackjackValue: 10,
  },
  {
    index: 24,
    type: "hearts",
    value: "J",
    rank: 10,
    slot: 11,
    blackjackValue: 10,
  },
  {
    index: 25,
    type: "hearts",
    value: "Q",
    rank: 11,
    slot: 12,
    blackjackValue: 10,
  },
  {
    index: 26,
    type: "hearts",
    value: "K",
    rank: 12,
    slot: 13,
    blackjackValue: 10,
  },
  {
    index: 27,
    type: "clubs",
    value: "A",
    rank: 0,
    slot: 1,
    blackjackValue: 11,
  },
  { index: 28, type: "clubs", value: "2", rank: 1, slot: 2, blackjackValue: 2 },
  { index: 29, type: "clubs", value: "3", rank: 2, slot: 3, blackjackValue: 3 },
  { index: 30, type: "clubs", value: "4", rank: 3, slot: 4, blackjackValue: 4 },
  { index: 31, type: "clubs", value: "5", rank: 4, slot: 5, blackjackValue: 5 },
  { index: 32, type: "clubs", value: "6", rank: 5, slot: 6, blackjackValue: 6 },
  { index: 33, type: "clubs", value: "7", rank: 6, slot: 7, blackjackValue: 7 },
  { index: 34, type: "clubs", value: "8", rank: 7, slot: 8, blackjackValue: 8 },
  { index: 35, type: "clubs", value: "9", rank: 8, slot: 9, blackjackValue: 9 },
  {
    index: 36,
    type: "clubs",
    value: "10",
    rank: 9,
    slot: 10,
    blackjackValue: 10,
  },
  {
    index: 37,
    type: "clubs",
    value: "J",
    rank: 10,
    slot: 11,
    blackjackValue: 10,
  },
  {
    index: 38,
    type: "clubs",
    value: "Q",
    rank: 11,
    slot: 12,
    blackjackValue: 10,
  },
  {
    index: 39,
    type: "clubs",
    value: "K",
    rank: 12,
    slot: 13,
    blackjackValue: 10,
  },
  {
    index: 40,
    type: "diamonds",
    value: "A",
    rank: 0,
    slot: 1,
    blackjackValue: 11,
  },
  {
    index: 41,
    type: "diamonds",
    value: "2",
    rank: 1,
    slot: 2,
    blackjackValue: 2,
  },
  {
    index: 42,
    type: "diamonds",
    value: "3",
    rank: 2,
    slot: 3,
    blackjackValue: 3,
  },
  {
    index: 43,
    type: "diamonds",
    value: "4",
    rank: 3,
    slot: 4,
    blackjackValue: 4,
  },
  {
    index: 44,
    type: "diamonds",
    value: "5",
    rank: 4,
    slot: 5,
    blackjackValue: 5,
  },
  {
    index: 45,
    type: "diamonds",
    value: "6",
    rank: 5,
    slot: 6,
    blackjackValue: 6,
  },
  {
    index: 46,
    type: "diamonds",
    value: "7",
    rank: 6,
    slot: 7,
    blackjackValue: 7,
  },
  {
    index: 47,
    type: "diamonds",
    value: "8",
    rank: 7,
    slot: 8,
    blackjackValue: 8,
  },
  {
    index: 48,
    type: "diamonds",
    value: "9",
    rank: 8,
    slot: 9,
    blackjackValue: 9,
  },
  {
    index: 49,
    type: "diamonds",
    value: "10",
    rank: 9,
    slot: 10,
    blackjackValue: 10,
  },
  {
    index: 50,
    type: "diamonds",
    value: "J",
    rank: 10,
    slot: 11,
    blackjackValue: 10,
  },
  {
    index: 51,
    type: "diamonds",
    value: "Q",
    rank: 11,
    slot: 12,
    blackjackValue: 10,
  },
  {
    index: 52,
    type: "diamonds",
    value: "K",
    rank: 12,
    slot: 13,
    blackjackValue: 10,
  },
];
