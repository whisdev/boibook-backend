import Game from "./game";
import * as actions from "./actions";
import { Games, GameLists } from "../../../../models";
import {
  checkBalance,
  checkMaxBet,
  generatInfo,
  handleBet,
  ObjectId,
} from "../../../base";
import { Request, Response, NextFunction } from "express";

const getScore = (cards: any) => {
  const score = cards.reduce((sum: number, card: any) => {
    if ((card?.value || 0) === 1) {
      return (sum += 11);
    } else {
      return (sum += card?.value || 0);
    }
  }, 0);
  if (score > 21 && cards.find((e: any) => e.value === 1)) {
    return cards.reduce(
      (sum: number, card: any) => (sum += card?.value || 0),
      0
    );
  } else {
    return score;
  }
};

const getCard = (card: any) => {
  return actions.deck.find(
    (e: any) => e.type === card.suite && e.value === card.text
  );
};

const settled = async ({
  req,
  _id,
  game,
  games,
  split = false,
}: {
  req: any;
  _id: any;
  game: any;
  games: any;
  split?: boolean | undefined;
}) => {
  const { history, dealerCards, wonOnRight, wonOnLeft } = game.getState();
  const score = getScore([dealerCards[0], dealerCards[1]]);
  let status = "LOST";
  let playerStatus = "LOST";
  let splitStatus = "LOST";
  if (wonOnRight === games.amount / 2) {
    playerStatus = "DRAW";
  } else if (wonOnRight > games.amount / 2) {
    playerStatus = "WIN";
  }
  if (wonOnLeft === games.amount / 2) {
    splitStatus = "DRAW";
  } else if (wonOnLeft > games.amount / 2) {
    splitStatus = "WIN";
  }
  let profit = wonOnRight + wonOnLeft;
  if (profit === games.amount) {
    status = "DRAW";
  } else if (profit > 0) {
    status = "WIN";
  }
  if (history.find((e: any) => e.type === "INSURANCE" && e.payload.bet > 0)) {
    if (score === 21) {
      status = "WIN";
      profit = games.amount;
    } else {
      status = "LOST";
      profit = games.amount;
    }
  }
  const dealerDraw = [] as any;
  const dealerCard = dealerCards.slice(2, dealerCards.length);
  for (const i in dealerCard) {
    dealerDraw.push(getCard(dealerCard[i]));
  }
  const check: any = await Games.findById(ObjectId(_id));
  const result: any = await Games.findByIdAndUpdate(
    _id,
    { profit, status, aBetting: game.getState(), $inc: { "betting.turn": 1 } },
    { new: true }
  );
  if (profit && check.status === "BET")
    await handleBet({
      req,
      currency: games.currency,
      userId: games.userId,
      amount: profit,
      type: "casino-bet-settled(blackjack)",
      info: result._id,
    });
  if (split) {
    return {
      type: "finish",
      turn: result.betting.turn,
      player: {
        status: playerStatus,
        odds: wonOnRight ? (wonOnRight / result.amount) * 2 : 0,
        profit: wonOnRight,
      },
      split: {
        status: splitStatus,
        odds: wonOnLeft ? (wonOnLeft / result.amount) * 2 : 0,
        profit: wonOnLeft,
      },
      betting: {
        dealerReveal: getCard(dealerCards[1]),
        dealerDraw,
      },
    };
  } else {
    return {
      type: "finish",
      turn: result.betting.turn,
      odds: profit ? profit / result.amount : 0,
      profit,
      split,
      status,
      betting: {
        dealerReveal: getCard(dealerCards[1]),
        dealerDraw,
      },
    };
  }
};

export const Blackjack = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (req.body.type) {
    case "info": {
      const { userId, currency, amount } = req.body;
      const gamelist: any = await GameLists.findOne({ id: req.body.gameId });
      const gameId = gamelist._id;
      const providerId = gamelist.providerId;
      const exist = await Games.findOne({
        userId,
        currency,
        gameId,
        status: "BET",
      });
      if (exist) {
        return res.json(exist);
      }
      const checked = await checkBalance({ userId, currency, amount });
      const checkedMax = await checkMaxBet({ currency, amount });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
      }
      if (!checkedMax) {
        return res.status(400).json("Maximum bet exceeded!");
      }
      await handleBet({
        req,
        currency,
        userId,
        amount: amount * -1,
        type: "casino-bet(blackjack)",
        info: generatInfo(),
      });
      const game = new Game({ currency, init: true });
      await game.dispatch(actions.deal({ bet: Number(amount) }));
      const gameData = {
        providerId,
        userId,
        currency,
        gameId,
        amount,
        odds: 2,
        aBetting: game.getState(),
        betting: { player: [], dealer: {}, turn: 0 },
      };
      const games = await Games.findOneAndUpdate(
        { userId, currency, gameId, status: "BET" },
        gameData,
        { upsert: true, new: true }
      );
      const { handInfo, dealerCards } = game.getState();
      const betting = {
        player: [
          getCard(handInfo.right.cards[0]),
          getCard(handInfo.right.cards[1]),
        ],
        dealer: getCard(dealerCards[0]),
        turn: 1,
      };
      const result = await Games.findByIdAndUpdate(
        games._id,
        { betting },
        { new: true }
      );
      return res.json(result);
    }
    case "split": {
      const { userId, betId } = req.body;
      const _id = ObjectId(betId);
      const games: any = await Games.findById(_id);
      const checked = await checkBalance({
        userId,
        currency: games.currency,
        amount: games.amount,
      });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
      }
      const game = new Game(games.aBetting);
      if (game.getState().stage === "done") {
        const result = await settled({ req, _id, game, games });
        return res.json(result);
      }
      await game.dispatch(actions.split());
      const { handInfo, dealerCards } = game.getState();
      await handleBet({
        req,
        currency: games.currency,
        userId,
        amount: games.amount * -1,
        type: "casino-bet-split(blackjack)",
        info: generatInfo(),
      });
      const result: any = await Games.findByIdAndUpdate(
        _id,
        {
          amount: games.amount * 2,
          aBetting: game.getState(),
          $inc: { "betting.turn": 1 },
        },
        { new: true }
      );
      return res.json({
        type: "continue",
        turn: result.betting.turn,
        betting: {
          player: [
            getCard(handInfo.right.cards[0]),
            getCard(handInfo.right.cards[1]),
          ],
          split: [
            getCard(handInfo.left.cards[0]),
            getCard(handInfo.left.cards[1]),
          ],
          dealer: [getCard(dealerCards[0])],
        },
      });
    }
    case "double": {
      const { userId, betId } = req.body;
      const _id = ObjectId(betId);
      const games: any = await Games.findById(_id);
      const checked = await checkBalance({
        userId,
        currency: games.currency,
        amount: games.amount,
      });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
      }
      const game = new Game(games.aBetting);
      if (game.getState().stage === "done") {
        const result = await settled({ req, _id, game, games });
        return res.json(result);
      }
      await game.dispatch(actions.double({ position: "right" }));
      await handleBet({
        req,
        currency: games.currency,
        userId,
        amount: games.amount * -1,
        type: "casino-bet-double(blackjack)",
        info: generatInfo(),
      });
      const result: any = await Games.findByIdAndUpdate(
        _id,
        {
          amount: games.amount * 2,
          aBetting: game.getState(),
          $inc: { "betting.turn": 1 },
        },
        { new: true }
      );
      const cards = game.getState().handInfo.right.cards;
      const card = getCard(cards[cards.length - 1]);
      return res.json({
        type: "continue",
        turn: result.betting.turn,
        betting: {
          player: card,
        },
      });
    }
    case "insurance": {
      const { userId, betId, bet } = req.body;
      const _id = ObjectId(betId);
      const games: any = await Games.findById(_id);
      const checked = await checkBalance({
        userId,
        currency: games.currency,
        amount: games.amount * 0.5,
      });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
      }
      const game = new Game(games.aBetting);
      if (bet) {
        await game.dispatch(actions.insurance({ bet: 1 }));
        await handleBet({
          req,
          currency: games.currency,
          userId,
          amount: games.amount * -0.5,
          type: "casino-bet-insurance(blackjack)",
          info: generatInfo(),
        });
        await Games.updateOne(
          { _id },
          {
            amount: games.amount * 1.5,
            aBetting: game.getState(),
            $inc: { "betting.turn": 1 },
          }
        );
      } else {
        await game.dispatch(actions.insurance({ bet: 0 }));
        await Games.updateOne(
          { _id },
          { aBetting: game.getState(), $inc: { "betting.turn": 1 } }
        );
      }
      return res.json(games);
    }
    case "hit": {
      const _id = ObjectId(req.body.betId);
      const games: any = await Games.findById(_id);
      const game = new Game(games.aBetting);
      const stage = game.getState().stage;
      if (stage === "player-turn-right") {
        await game.dispatch(actions.hit({ position: "right" }));
        await Games.updateOne(
          { _id },
          { aBetting: game.getState(), $inc: { "betting.turn": 1 } }
        );
        const cards = game.getState().handInfo.right.cards;
        const card = getCard(cards[cards.length - 1]);
        const result = {
          type: "continue",
          turn: games.betting.turn,
          betting: {
            player: card,
          },
        };
        return res.json(result);
      } else if (stage === "player-turn-left") {
        await game.dispatch(actions.hit({ position: "left" }));
        await Games.updateOne(
          { _id },
          { aBetting: game.getState(), $inc: { "betting.turn": 1 } }
        );
        const cards = game.getState().handInfo.left.cards;
        const result = {
          type: "continue",
          turn: games.betting.turn,
          betting: {
            player: getCard(cards[cards.length - 1]),
          },
        };
        return res.json(result);
      } else if (stage === "done") {
        const result = await settled({ req, _id, game, games });
        return res.json(result);
      }
    }
    case "stand": {
      const _id = ObjectId(req.body.betId);
      const games: any = await Games.findById(_id);
      const game = new Game(games.aBetting);
      const { stage, history } = game.getState();
      if (history.find((e: any) => e.type === "SPLIT")) {
        if (stage === "player-turn-right") {
          await game.dispatch(actions.stand({ position: "right" }));
          const result: any = await Games.findByIdAndUpdate(
            _id,
            { aBetting: game.getState(), $inc: { "betting.turn": 1 } },
            { new: true }
          );
          return res.json({
            type: "continue",
            turn: result.betting.turn,
          });
        } else if (stage === "player-turn-left" || stage === "done") {
          const cards = game.getState().handInfo.left.cards;
          const score = getScore(cards);
          if (req.body.auto && score < 21) {
            const result: any = await Games.findByIdAndUpdate(
              _id,
              { aBetting: game.getState(), $inc: { "betting.turn": 1 } },
              { new: true }
            );
            return res.json({
              type: "continue",
              turn: result.betting.turn,
            });
          } else {
            if (stage === "player-turn-left") {
              await game.dispatch(actions.stand({ position: "left" }));
            }
            const result = await settled({
              req,
              _id,
              game,
              games,
              split: true,
            });
            return res.json(result);
          }
        }
      } else {
        if (stage === "player-turn-right") {
          await game.dispatch(actions.stand({ position: "right" }));
        }
        const result = await settled({ req, _id, game, games });
        return res.json(result);
      }
    }
  }
};
