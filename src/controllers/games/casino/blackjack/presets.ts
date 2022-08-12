import * as TYPES from "./constants";
const deck52 = require("52-deck");

export const getDefaultSideBets = (active: any) => {
  return {
    luckyLucky: active,
    perfectPairs: active,
    royalMatch: active,
    luckyLadies: active,
    inBet: active,
    MatchTheDealer: active,
  };
};

export const getRules = ({
  decks = 1,
  standOnSoft17 = true,
  double = "any",
  split = true,
  doubleAfterSplit = true,
  surrender = true,
  insurance = true,
  showdownAfterAceSplit = true,
}) => {
  return {
    decks: decks || 1,
    standOnSoft17: standOnSoft17,
    double: double,
    split: split,
    doubleAfterSplit: doubleAfterSplit,
    surrender: surrender,
    insurance: insurance,
    showdownAfterAceSplit: showdownAfterAceSplit,
  };
};

export const defaultState = (rules: any) => {
  return {
    isfunc: false,
    hits: 0,
    currency: "",
    initialBet: 0,
    finalBet: 0,
    finalWin: 0,
    wonOnRight: 0,
    wonOnLeft: 0,
    stage: TYPES.STAGE_READY,
    deck: deck52.shuffle(deck52.newDecks(rules.decks)),
    handInfo: {
      left: {},
      right: {},
    },
    history: [],
    availableBets: getDefaultSideBets(true),
    sideBetsInfo: {},
    rules: rules,
    dealerHoleCard: null,
    dealerHasBlackjack: false,
    dealerHasBusted: false,
  };
};
