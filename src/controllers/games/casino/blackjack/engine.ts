import luckyLucky from "./paytables/luchyLuchy";
import * as TYPES from "./constants";

export const isNull = (obj: any) => obj === null;

export const isUndefined = (obj: any) => obj === undefined;

export const isNullOrUndef = (obj: any) => isUndefined(obj) || isNull(obj);

export const calculate = (array: any) => {
  if (array.length === 1) {
    if (isNullOrUndef(array[0])) {
      return null;
    }
    const value = array[0].value;
    return {
      hi: value === 1 ? 11 : value,
      lo: value === 1 ? 1 : value,
    };
  }
  const aces = [] as any;
  const value = array.reduce((memo: any, x: any) => {
    if (x.value === 1) {
      aces.push(1);
      return memo;
    }
    memo += x.value;
    return memo;
  }, 0);
  return aces.reduce(
    (memo: any) => {
      if (memo.hi + 11 <= 21) {
        memo.hi += 11;
        memo.lo += 1;
      } else {
        memo.hi += 1;
        memo.lo += 1;
      }
      if (memo.hi > 21 && memo.lo <= 21) {
        memo.hi = memo.lo;
      }
      return memo;
    },
    {
      hi: value,
      lo: value,
    }
  );
};

export const getHigherValidValue = (handValue: any) =>
  handValue.hi <= 21 ? handValue.hi : handValue.lo;

export const checkForBusted = (handValue: any) =>
  handValue.hi > 21 && handValue.lo === handValue.hi;

export const isBlackjack = (array: any) =>
  array.length === 2 && calculate(array)?.hi === 21;

export const isSoftHand = (array: any) => {
  return (
    array.some((x: any) => x.value === 1) &&
    array.reduce((memo: any, x: any) => {
      memo += x.value === 1 && memo < 11 ? 11 : x.value;
      return memo;
    }, 0) === 17
  );
};

export const isSuited = (array: any = []) => {
  if (array.length === 0) {
    return false;
  }
  const suite = array[0].suite;
  return array.every((x: any) => x.suite === suite);
};

export const countCards = (array: any) => {
  const systems = {
    "Hi-Lo": [-1, 1, 1, 1, 1, 1, 0, 0, 0, -1, -1, -1, -1],
  };
  return array.reduce((memo: any, x: any) => {
    memo += systems["Hi-Lo"][x.value - 1];
    return memo;
  }, 0);
};

export const getHandInfo = (
  playerCards: any,
  dealerCards: any,
  hasSplit = false
) => {
  const handValue = calculate(playerCards);
  if (!handValue) {
    return null;
  }
  const hasBlackjack = isBlackjack(playerCards) && hasSplit === false;
  const hasBusted = checkForBusted(handValue);
  const isClosed = hasBusted || hasBlackjack || handValue.hi === 21;
  const canDoubleDown = !isClosed && true;
  const canSplit =
    playerCards.length > 1 &&
    playerCards[0].value === playerCards[1].value &&
    !isClosed;
  const canInsure = dealerCards[0].value === 1 && !isClosed;
  return {
    cards: playerCards,
    playerValue: handValue,
    playerHasBlackjack: hasBlackjack,
    playerHasBusted: hasBusted,
    playerHasSurrendered: false,
    close: isClosed,
    availableActions: {
      double: canDoubleDown,
      split: canSplit,
      insurance: canInsure,
      hit: !isClosed,
      stand: !isClosed,
      surrender: !isClosed,
    },
  };
};

export const getHandInfoAfterDeal = (
  playerCards: any,
  dealerCards: any,
  initialBet: any
) => {
  const hand = getHandInfo(playerCards, dealerCards) as any;
  hand.bet = initialBet;
  // After deal, even if we got a blackjack the hand cannot be considered closed.
  const availableActions = hand.availableActions;
  hand.availableActions = {
    ...availableActions,
    stand: true,
    hit: true,
    surrender: true,
  };
  return {
    ...hand,
    close: hand.playerHasBlackjack,
  };
};

export const getHandInfoAfterSplit = (
  playerCards: any,
  dealerCards: any,
  initialBet: any
) => {
  const hand = getHandInfo(playerCards, dealerCards, true) as any;
  const availableActions = hand.availableActions;
  hand.availableActions = {
    ...availableActions,
    split: false,
    double: !hand.close && playerCards.length === 2,
    insurance: false,
    surrender: false,
  };
  hand.bet = initialBet;
  return hand;
};

export const getHandInfoAfterHit = (
  playerCards: any,
  dealerCards: any,
  initialBet: any,
  hasSplit: any
) => {
  const hand = getHandInfo(playerCards, dealerCards, hasSplit) as any;
  const availableActions = hand.availableActions;
  hand.availableActions = {
    ...availableActions,
    double: playerCards.length === 2,
    split: false,
    insurance: false,
    surrender: false,
  };
  hand.bet = initialBet;
  return hand;
};

export const getHandInfoAfterDouble = (
  playerCards: any,
  dealerCards: any,
  initialBet: any,
  hasSplit: any
) => {
  const hand = getHandInfoAfterHit(
    playerCards,
    dealerCards,
    initialBet,
    hasSplit
  ) as any;
  const availableActions = hand.availableActions;
  hand.availableActions = {
    ...availableActions,
    hit: false,
    stand: false,
  };
  hand.bet = initialBet * 2;
  return {
    ...hand,
    close: true,
  };
};

export const getHandInfoAfterStand = (handInfo: any) => {
  return {
    ...handInfo,
    close: true,
    availableActions: {
      double: false,
      split: false,
      insurance: false,
      hit: false,
      stand: false,
      surrender: false,
    },
  };
};

export const getHandInfoAfterSurrender = (handInfo: any) => {
  const hand = getHandInfoAfterStand(handInfo);
  return {
    ...hand,
    playerHasSurrendered: true,
    close: true,
  };
};

export const getHandInfoAfterInsurance = (
  playerCards: any,
  dealerCards: any
) => {
  const hand = getHandInfo(playerCards, dealerCards) as any;
  const availableActions = hand.availableActions;
  hand.availableActions = {
    ...availableActions,
    stand: true,
    hit: true,
    surrender: true,
    insurance: false,
  };
  return {
    ...hand,
    close: hand.playerHasBlackjack,
  };
};

export const isLuckyLucky = (playerCards: any, dealerCards: any) => {
  // Player hand and dealer's up card sum to 19, 20, or 21 ("Lucky Lucky")
  const v1 = calculate(playerCards)?.hi + calculate(dealerCards)?.hi;
  const v2 = calculate(playerCards)?.lo + calculate(dealerCards)?.lo;
  const v3 = calculate(playerCards)?.hi + calculate(dealerCards)?.lo;
  const v4 = calculate(playerCards)?.lo + calculate(dealerCards)?.hi;
  return (
    (v1 >= 19 && v1 <= 21) ||
    (v2 >= 19 && v2 <= 21) ||
    (v3 >= 19 && v3 <= 21) ||
    (v4 >= 19 && v4 <= 21)
  );
};

export const getLuckyLuckyMultiplier = (playerCards: any, dealerCards: any) => {
  const cards = [].concat(playerCards, dealerCards);
  const isSameSuite = isSuited(cards);
  const flatCards = cards.map((x: any) => x.value).join("");
  const value = calculate(cards);
  return luckyLucky(flatCards, isSameSuite, value);
};

export const isPerfectPairs = (playerCards: any) =>
  playerCards[0].value === playerCards[1].value;

export const getSideBetsInfo = (
  availableBets: any,
  sideBets: any,
  playerCards: any,
  dealerCards: any
) => {
  const sideBetsInfo = {
    luckyLucky: 0,
    perfectPairs: 0,
  };
  if (
    availableBets.luckyLucky &&
    sideBets.luckyLucky &&
    isLuckyLucky(playerCards, dealerCards)
  ) {
    const multiplier = getLuckyLuckyMultiplier(playerCards, dealerCards);
    sideBetsInfo.luckyLucky = sideBets.luckyLucky * multiplier;
  }
  if (
    availableBets.perfectPairs &&
    sideBets.perfectPairs &&
    isPerfectPairs(playerCards)
  ) {
    // TODO: impl colored pairs
    // TODO: impl mixed pairs
    sideBetsInfo.perfectPairs = sideBets.perfectPairs * 5;
  }
  return sideBetsInfo;
};

export const isActionAllowed = (actionName: any, stage: any) => {
  if (actionName === TYPES.RESTORE) {
    return true;
  }
  switch (stage) {
    case TYPES.STAGE_READY: {
      return [TYPES.RESTORE, TYPES.DEAL].indexOf(actionName) > -1;
    }
    case TYPES.STAGE_PLAYER_TURN_RIGHT: {
      return (
        [
          TYPES.STAND,
          TYPES.INSURANCE,
          TYPES.SURRENDER,
          TYPES.SPLIT,
          TYPES.HIT,
          TYPES.DOUBLE,
        ].indexOf(actionName) > -1
      );
    }
    case TYPES.STAGE_PLAYER_TURN_LEFT: {
      return [TYPES.STAND, TYPES.HIT, TYPES.DOUBLE].indexOf(actionName) > -1;
    }
    case TYPES.SHOWDOWN: {
      return [TYPES.SHOWDOWN, TYPES.STAND].indexOf(actionName) > -1;
    }
    case TYPES.STAGE_DEALER_TURN: {
      return [TYPES.DEALER_HIT].indexOf(actionName) > -1;
    }
    default: {
      return false;
    }
  }
};

export const getPrize = (playerHand: any, dealerCards: any) => {
  const {
    close = false,
    playerHasSurrendered = true,
    playerHasBlackjack = false,
    playerHasBusted = true,
    playerValue = {},
    bet = 0,
  } = playerHand;
  const higherValidDealerValue = getHigherValidValue(calculate(dealerCards));
  const dealerHasBlackjack = isBlackjack(dealerCards);
  if (!close) {
    return 0;
  }
  if (playerHasBusted) {
    return 0;
  }
  if (playerHasSurrendered) {
    return bet / 2;
  }
  if (playerHasBlackjack && !dealerHasBlackjack) {
    return bet + bet * 1.5;
  }
  const dealerHasBusted = higherValidDealerValue > 21;
  if (dealerHasBusted) {
    return bet + bet;
  }
  const higherValidPlayerValue = getHigherValidValue(playerValue);
  if (higherValidPlayerValue > higherValidDealerValue) {
    return bet + bet;
  } else if (higherValidPlayerValue === higherValidDealerValue) {
    return bet;
  }
  return 0;
};

export const getPrizes = ({
  history,
  handInfo: { left, right },
  dealerCards,
}: {
  history: any;
  handInfo: any;
  dealerCards: any;
}) => {
  const finalBet = history.reduce((memo: any, x: any) => {
    memo += x.value;
    return memo;
  }, 0);
  const wonOnRight = getPrize(right, dealerCards);
  const wonOnLeft = getPrize(left, dealerCards);
  return {
    finalBet: finalBet,
    wonOnRight: wonOnRight,
    wonOnLeft: wonOnLeft,
  };
};
