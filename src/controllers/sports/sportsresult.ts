import { CronJob } from "cron";
import * as moment from "moment";
import { handleBet, ObjectId } from "../base";
import { deleteMatchs } from "./sportsmatchs";
import { SportsBets, SportsBetting } from "../../models";
import { getEndedDate, getEnds } from "./sportsrealtime";
import {
  removePendingPayment,
  UpdatePrices,
  withdrawalTimer,
} from "../payment";

let count = 0;
let single = 0;
let multi = 0;

/**
 * Match Winner 2-Way
 */
const get1X2 = ({
  h_score,
  a_score,
  oddType,
}: {
  h_score: number;
  a_score: number;
  oddType: string;
}): string => {
  if (h_score === a_score && oddType === "draw") {
    return "WIN";
  } else if (h_score > a_score && oddType === "home") {
    return "WIN";
  } else if (h_score < a_score && oddType === "away") {
    return "WIN";
  } else {
    return "LOST";
  }
};

/**
 * Draw No Bet (Cricket)
 */
const getDrawNoBet = ({
  h_score,
  a_score,
  oddType,
}: {
  h_score: number;
  a_score: number;
  oddType: string;
}): string => {
  if (h_score === a_score) {
    return "REFUND";
  } else if (h_score > a_score && oddType === "home") {
    return "WIN";
  } else if (h_score < a_score && oddType === "away") {
    return "WIN";
  } else {
    return "LOST";
  }
};

/**
 * Asian Handicap
 */
const getHandicap = ({
  h_score,
  a_score,
  oddType,
  handicap,
}: {
  h_score: number;
  a_score: number;
  oddType: string;
  handicap: number;
}): string => {
  const isFavorite = Number(handicap) > 0 ? true : false;
  const _handicap = Math.abs(handicap);
  let d_score = Math.floor(_handicap);
  let handicap_od = d_score < 1 ? _handicap : _handicap % d_score;
  if (oddType === "home") {
    handicap_od = isFavorite ? handicap_od : handicap_od * -1;
    h_score = h_score + (isFavorite ? d_score : d_score * -1);
  } else if (oddType === "away") {
    let temp = h_score;
    handicap_od = isFavorite ? handicap_od * -1 : handicap_od;
    h_score = a_score - (isFavorite ? d_score : d_score * -1);
    a_score = temp;
  }
  if (handicap_od === 0.25) {
    if (h_score > a_score) {
      return "WIN";
    } else if (h_score === a_score) {
      return "HALF_WIN";
    } else {
      return "LOST";
    }
  } else if (handicap_od === 0.5) {
    if (h_score > a_score) {
      return "WIN";
    } else if (h_score === a_score) {
      return "WIN";
    } else {
      return "LOST";
    }
  } else if (handicap_od === 0.75) {
    if (h_score > a_score) {
      return "WIN";
    } else if (h_score === a_score) {
      return "WIN";
    } else if (h_score + 1 === a_score) {
      return "HALF_LOST";
    } else {
      return "LOST";
    }
  } else if (handicap_od === -0.25) {
    if (h_score > a_score) {
      return "WIN";
    } else if (h_score === a_score) {
      return "HALF_LOST";
    } else {
      return "LOST";
    }
  } else if (handicap_od === -0.5) {
    if (h_score > a_score) {
      return "WIN";
    } else {
      return "LOST";
    }
  } else if (handicap_od === -0.75) {
    if (h_score > a_score + 1) {
      return "WIN";
    } else if (h_score === a_score + 1) {
      return "HALF_WIN";
    } else {
      return "LOST";
    }
  } else {
    if (h_score > a_score) {
      return "WIN";
    } else if (h_score === a_score) {
      return "REFUND";
    } else {
      return "LOST";
    }
  }
};

/**
 * Over/Under
 */
const getOverUnder = ({
  t_score,
  handicap,
  oddType,
}: {
  t_score: number;
  handicap: number;
  oddType: string;
}): string => {
  handicap = Math.abs(handicap);
  let d_score = Math.floor(handicap);
  let over_under = d_score < 1 ? handicap : handicap % d_score;
  if (oddType === "under") {
    if (over_under === 0.25) {
      if (t_score < d_score) {
        return "WIN";
      } else if (t_score === d_score) {
        return "HALF_WIN";
      } else {
        return "LOST";
      }
    } else if (over_under === 0.5) {
      if (t_score <= d_score) {
        return "WIN";
      } else {
        return "LOST";
      }
    } else if (over_under === 0.75) {
      if (t_score <= d_score) {
        return "WIN";
      } else if (t_score === d_score + 1) {
        return "HALF_LOST";
      } else {
        return "LOST";
      }
    } else {
      if (t_score < d_score) {
        return "WIN";
      } else if (t_score === d_score) {
        return "REFUND";
      } else {
        return "LOST";
      }
    }
  } else if (oddType === "over") {
    if (over_under === 0.25) {
      if (t_score > d_score) {
        return "WIN";
      } else if (t_score === d_score) {
        return "HALF_LOST";
      } else {
        return "LOST";
      }
    } else if (over_under === 0.5) {
      if (t_score > d_score) {
        return "WIN";
      } else {
        return "LOST";
      }
    } else if (over_under === 0.75) {
      if (t_score > d_score + 1) {
        return "WIN";
      } else if (t_score === d_score + 1) {
        return "HALF_WIN";
      } else {
        return "LOST";
      }
    } else {
      if (t_score > d_score) {
        return "WIN";
      } else if (t_score === d_score) {
        return "REFUND";
      } else {
        return "LOST";
      }
    }
  } else {
    return "";
  }
};

const getScore = (scores: { home: string; away: string }[]) => {
  let home = 0,
    away = 0;
  for (const i in scores) {
    if (Number(scores[i].home) > Number(scores[i].away)) {
      home++;
    } else if (Number(scores[i].home) < Number(scores[i].away)) {
      away++;
    }
  }
  return { home, away };
};

const getFScore = (scores: any) => {
  return scores[Object.keys(scores).sort().reverse()[0]];
};

const getSHScore = (scores: any) => {
  const f_score = scores[Object.keys(scores).sort()[0]];
  const home = Number(f_score.home);
  const away = Number(f_score.away);
  return { home, away, total: home + away };
};

const getBHScore = (scores: { home: string; away: string }[]) => {
  let f_score = null as any;
  if (!scores) {
    f_score = null;
  } else if (Object.keys(scores).length >= 6) {
    f_score = scores["3"];
  } else if (Object.keys(scores).length >= 3) {
    f_score = scores["1"];
  }
  if (f_score) {
    const home = Number(f_score.home);
    const away = Number(f_score.away);
    return { home, away, total: home + away, state: true };
  } else {
    return { home: 0, away: 0, total: 0, state: false };
  }
};

const getBQScore = (scores: any, quarter: string) => {
  let f_score = {
    home: 0,
    away: 0,
  };
  let state = true;
  if (quarter === "1" || quarter === "0") {
    f_score = scores["1"];
  } else if (quarter === "2") {
    f_score = scores["2"];
  } else if (quarter === "3") {
    f_score = scores["4"];
  } else if (quarter === "4") {
    f_score = scores["5"];
  }
  if (f_score.home === 0 && f_score.away === 0) {
    state = false;
  }
  const home = Number(f_score.home);
  const away = Number(f_score.away);
  return { home, away, total: home + away, state };
};

const getCorner = (scores: number[]) => {
  if (scores && scores.length) {
    return Number(scores[0]) + Number(scores[1]);
  } else {
    return false;
  }
};

const getHandicapData = (handicap: any): number => {
  return Number(handicap.split(",")[0]);
};

const getHockeyScore = (scores: { home: string; away: string }[]) => {
  let h_score = Object.values(scores)
    .slice(0, 3)
    .reduce((sum, { home }) => (sum += Number(home)), 0);
  let a_score = Object.values(scores)
    .slice(0, 3)
    .reduce((sum, { away }) => (sum += Number(away)), 0);
  return { h_score, a_score };
};

const getScores = ({
  SportId,
  scores,
  ss,
}: {
  SportId: number;
  scores: { home: string; away: string }[];
  ss: string;
}): { h_score: number; a_score: number; t_score: number; state: boolean } => {
  let h_score = 0,
    a_score = 0,
    t_score = 0;
  if (SportId === 1) {
    if (Object.keys(scores).length === 3) {
      let h_score = Object.values(scores)
        .slice(0, 2)
        .reduce((sum, { home }) => (sum += Number(home)), 0);
      let a_score = Object.values(scores)
        .slice(0, 2)
        .reduce((sum, { away }) => (sum += Number(away)), 0);
      t_score = Number(h_score) + Number(a_score);
      return { h_score, a_score, t_score, state: true };
    } else {
      const f_score = getFScore(scores);
      h_score = Number(f_score.home);
      a_score = Number(f_score.away);
      t_score = h_score + a_score;
      return { h_score, a_score, t_score, state: true };
    }
  } else if (
    SportId === 12 ||
    SportId === 17 ||
    SportId === 18 ||
    SportId === 19 ||
    SportId === 78
  ) {
    const f_score = getFScore(scores);
    h_score = Number(f_score.home);
    a_score = Number(f_score.away);
    t_score = h_score + a_score;
    return { h_score, a_score, t_score, state: true };
  } else if (SportId === 13) {
    const f_score = getScore(scores);
    if (f_score.home === f_score.away) {
      return { h_score, a_score, t_score, state: false };
    } else {
      const home_score = Object.values(scores).reduce(
        (sum, { home }) => (sum += Number(home)),
        0
      );
      const away_score = Object.values(scores).reduce(
        (sum, { away }) => (sum += Number(away)),
        0
      );
      h_score = Number(f_score.home);
      a_score = Number(f_score.away);
      t_score = home_score + away_score;
      return { h_score, a_score, t_score, state: true };
    }
  } else if (
    SportId === 91 ||
    SportId === 92 ||
    SportId === 94 ||
    SportId === 95
  ) {
    const home_score = Object.values(scores).reduce(
      (sum, { home }) => (sum += Number(home)),
      0
    );
    const away_score = Object.values(scores).reduce(
      (sum, { away }) => (sum += Number(away)),
      0
    );
    const f_score = getScore(scores);
    h_score = Number(f_score.home);
    a_score = Number(f_score.away);
    t_score = home_score + away_score;
    return { h_score, a_score, t_score, state: true };
  } else if (
    SportId === 8 ||
    SportId === 9 ||
    SportId === 14 ||
    SportId === 15 ||
    SportId === 16 ||
    SportId === 36 ||
    SportId === 66 ||
    SportId === 83 ||
    SportId === 90 ||
    SportId === 107 ||
    SportId === 110 ||
    SportId === 151
  ) {
    const s = ss.split("-");
    h_score = Number(s[0]);
    a_score = Number(s[1]);
    t_score = h_score + a_score;
    return { h_score, a_score, t_score, state: true };
  } else if (SportId === 3) {
    const s1 = ss.split("-");
    const s2 = ss.split(",");
    if (s1[0] && s1[1]) {
      h_score = Number(s1[0].split("/")[0]);
      a_score = Number(s1[1].split("/")[0]);
      t_score = h_score + a_score;
      return { h_score, a_score, t_score, state: true };
    } else if (s2[0] && s2[1]) {
      h_score = Number(s2[0].split("/")[0]);
      a_score = Number(s2[1].split("/")[0]);
      t_score = h_score + a_score;
      return { h_score, a_score, t_score, state: true };
    } else {
      return { h_score, a_score, t_score, state: false };
    }
  } else if (SportId === 75) {
    return { h_score, a_score, t_score, state: false };
  } else {
    return { h_score, a_score, t_score, state: false };
  }
};

const getProfit = ({ status, bet }: { status: string; bet: any }) => {
  if (status === "WIN") {
    return bet.stake * bet.odds;
  } else if (status === "LOST") {
    return bet.stake * -1;
  } else if (status === "REFUND") {
    return bet.stake;
  } else if (status === "HALF_WIN") {
    return (bet.stake * bet.odds) / 2 + bet.stake / 2;
  } else if (status === "HALF_LOST") {
    return (bet.stake / 2) * -1;
  }
};

export const bettingSettled = async ({
  bet,
  data,
}: {
  bet: any;
  data: any;
}) => {
  if (!bet || !data) {
    return { profit: 0, status: "", scores: {}, state: false };
  }
  const oddType = bet.oddType;
  const SportId = bet.SportId;
  const marketId = bet.marketId;
  let status = "" as string;
  const { h_score, a_score, t_score, state } = getScores({
    SportId,
    scores: data.scores,
    ss: data.ss,
  });
  if (state) {
    if (marketId.indexOf("_1") !== -1 || marketId === "13_4") {
      if (SportId === 1) {
        status = get1X2({ h_score, a_score, oddType });
      } else if (SportId === 17) {
        const { h_score, a_score } = getHockeyScore(data.scores);
        status = get1X2({ h_score, a_score, oddType });
      } else {
        status = get1X2({ h_score, a_score, oddType });
      }
    } else if (marketId.indexOf("_2") !== -1) {
      const handicap = getHandicapData(bet.oddData.handicap);
      status = getHandicap({ h_score, a_score, oddType, handicap });
    } else if (marketId.indexOf("_3") !== -1) {
      const handicap = getHandicapData(bet.oddData.handicap);
      status = getOverUnder({ t_score, oddType, handicap });
    } else if (marketId === "1_4") {
      const corner = getCorner(data.stats?.corners);
      const handicap = getHandicapData(bet.oddData.handicap);
      if (corner) {
        status = getOverUnder({ t_score: corner, oddType, handicap });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "1_5") {
      const { home, away } = getSHScore(data.scores);
      const handicap = getHandicapData(bet.oddData.handicap);
      status = getHandicap({ h_score: home, a_score: away, oddType, handicap });
    } else if (marketId === "1_6") {
      const { total } = getSHScore(data.scores);
      const handicap = getHandicapData(bet.oddData.handicap);
      status = getOverUnder({ t_score: total, oddType, handicap });
    } else if (marketId === "1_7") {
      const corner = getCorner(data.stats.corner_h);
      const handicap = getHandicapData(bet.oddData.handicap);
      if (corner) {
        status = getOverUnder({ t_score: corner, oddType, handicap });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "1_8") {
      const { home, away } = getSHScore(data.scores);
      status = get1X2({ h_score: home, a_score: away, oddType });
    } else if (marketId === "18_4") {
      const { home, away, state } = getBHScore(data.scores);
      if (state) {
        status = get1X2({ h_score: home, a_score: away, oddType });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "18_5") {
      const { home, away, state } = getBHScore(data.scores);
      if (state) {
        const handicap = getHandicapData(bet.oddData.handicap);
        status = getHandicap({
          h_score: home,
          a_score: away,
          oddType,
          handicap,
        });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "18_6") {
      const { total, state } = getBHScore(data.scores);
      if (state) {
        const handicap = getHandicapData(bet.oddData.handicap);
        status = getOverUnder({ t_score: total, oddType, handicap });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "18_7") {
      const { home, away, state } = getBQScore(data.scores, bet.oddData.q);
      if (state) {
        status = get1X2({ h_score: home, a_score: away, oddType });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "18_8") {
      const { home, away, state } = getBQScore(data.scores, bet.oddData.q);
      if (state) {
        const handicap = getHandicapData(bet.oddData.handicap);
        status = getHandicap({
          h_score: home,
          a_score: away,
          oddType,
          handicap,
        });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "18_9") {
      const { total, state } = getBQScore(data.scores, bet.oddData.q);
      if (state) {
        const handicap = getHandicapData(bet.oddData.handicap);
        status = getOverUnder({ t_score: total, oddType, handicap });
      } else {
        status = "REFUND";
      }
    } else if (marketId === "3_4") {
      status = getDrawNoBet({ h_score, a_score, oddType });
    } else {
      status = "REFUND";
    }
    const profit = getProfit({ status, bet });
    const scores = { home: h_score, away: a_score, total: t_score };
    return { profit, status, scores, state };
  } else {
    console.log(bet.eventId, bet.SportId);
    return { profit: 0, status: "", scores: {}, state: false };
  }
};

const getResult = async () => {
  const sportsBets = await SportsBetting.aggregate([
    {
      $match: { status: "BET" },
    },
    {
      $lookup: {
        from: "sports_end_matchs",
        localField: "eventId",
        foreignField: "id",
        as: "matchs",
      },
    },
    {
      $unwind: "$matchs",
    },
    {
      $match: {
        "matchs.time_status": 3,
      },
    },
  ]);
  for (const i in sportsBets) {
    const data = (await getEndedDate(sportsBets[i].eventId)) as any;
    if (!data) {
      console.log(`no data => `, data, sportsBets[i].eventId);
    } else if (data.id !== String(sportsBets[i].eventId)) {
      console.log(`not match id => `, data.id, sportsBets[i].eventId);
    } else if (
      data?.ss !== sportsBets[i].matchs?.ss ||
      JSON.stringify(data?.scores) !==
        JSON.stringify(sportsBets[i].matchs?.scores)
    ) {
      console.log(`not match scores => `, data, sportsBets[i].matchs);
    } else if (data.time_status === "3") {
      const bet = sportsBets[i];
      console.log(data.time_status, "=>", bet.eventId);
      if (bet.matchs.time_status != "3" || data.time_status != "3") {
        console.log(data);
      } else {
        const reuslt = await bettingSettled({ bet, data });
        if (reuslt.state) {
          await SportsBetting.updateOne({ _id: ObjectId(bet._id) }, reuslt);
          count++;
        }
      }
    } else {
      console.log(`time status => `, data, sportsBets[i].eventId);
    }
  }
};

const updateBalance = async () => {
  const sportsBets = await SportsBets.aggregate([
    { $match: { status: "BET" } },
    {
      $lookup: {
        from: "sports_bettings",
        localField: "_id",
        foreignField: "betId",
        as: "bettings",
      },
    },
  ]);
  for (const i in sportsBets) {
    const { userId, currency, bettings, stake } = sportsBets[i];
    if (sportsBets[i].type === "single") {
      const bettings = sportsBets[i].bettings[0];
      const status = bettings.status;
      const profit = bettings.profit;
      const _id = ObjectId(bettings.betId);
      if (status !== "BET") {
        await SportsBets.updateOne({ _id }, { status, profit });
        if (status !== "BET" && status !== "SETTLED" && status !== "LOST") {
          if (status === "HALF_LOST") {
            await handleBet({
              userId,
              currency,
              amount: profit * -1,
              type: "sports-single-settled",
              info: String(_id),
            });
          } else {
            await handleBet({
              userId,
              currency,
              amount: profit,
              type: "sports-single-settled",
              status: status === "WIN" || status === "HALF_WIN",
              info: String(_id),
            });
          }
        }
        single++;
      }
    } else if (sportsBets[i].type === "multi") {
      const _id = ObjectId(sportsBets[i]._id);
      let lostCount = 0;
      let endCount = 0;
      let potential = sportsBets[i].stake;
      for (const j in bettings) {
        const { status, odds } = bettings[j];
        if (status !== "BET") {
          if (status === "LOST") {
            lostCount++;
          } else if (status === "WIN") {
            potential *= odds;
          } else if (status === "HALF_WIN") {
            const stake = sportsBets[i].stake;
            potential *= ((stake * odds - stake) / 2 + stake) / stake;
          } else if (status === "HALF_LOST") {
            potential *= 0.5;
          }
          endCount++;
        }
      }
      if (lostCount > 0) {
        await SportsBets.updateOne(
          { _id },
          { status: "LOST", profit: stake * -1 }
        );
        multi++;
      } else if (endCount === bettings.length) {
        const status = lostCount === 0 ? "WIN" : "LOST";
        const profit = lostCount === 0 ? potential : stake * -1;
        await SportsBets.updateOne({ _id }, { status, profit });
        if (lostCount === 0) {
          await handleBet({
            userId,
            currency,
            amount: profit,
            type: "sports-multi-settled",
            status: true,
            info: String(_id),
          });
        }
        multi++;
      }
    }
  }
};

export const Result = () => {
  try {
    const job = new CronJob(process.env.RESULT_TIME as string, () => {
      getEnds();
      getResult();
      deleteMatchs();
      UpdatePrices();
      updateBalance();
      withdrawalTimer();
      removePendingPayment();
      console.log(moment().format("YYYY-MM-DD hh:mm:ss"), count, single, multi);
    });
    job.start();
  } catch (error) {
    console.log(error);
  }
};
