import * as moment from "moment";
import * as request from "request";
import { CronJob } from "cron";
import {
  SportsMatchs,
  SportsLists,
  SportsEndMatchs,
  SportsLeagues,
  SportsFixMatchs,
  SportsBetting,
} from "../../models";

const token = process.env.SPORTSBOOK_APIKEY;
let count = 0;
let ecount = 0;
let ecount1 = 0;
let scount = 0;

export const Matchs1 = () => {
  try {
    console.log("server on: matchs1");
    getEvents1();
    const job1 = new CronJob(process.env.LIVE_TIME as string, () => {
      getEvents1();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job1.start();
  } catch (error) {
    console.log(`matchs1 server error`, error);
  }
};

export const Matchs2 = () => {
  try {
    console.log("server on: matchs2");
    getEvents2();
    const job2 = new CronJob(process.env.UPCOMIN_TIME as string, () => {
      getEvents2();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job2.start();
  } catch (error) {
    console.log(`matchs2 server error`, error);
  }
};

export const Matchs3 = () => {
  try {
    console.log("server on: matchs3");
    getEvents3();
    const job3 = new CronJob(process.env.PRE_TIME as string, () => {
      getEvents3();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job3.start();
  } catch (error) {
    console.log(`matchs3 server error`, error);
  }
};

export const Odds1 = () => {
  try {
    console.log("server on: odds1");
    getOdd1();
    const job1 = new CronJob(process.env.LIVE_TIME as string, () => {
      getOdd1();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job1.start();
  } catch (error) {
    console.log(`odds1 server error`, error);
  }
};

export const Odds2 = () => {
  try {
    console.log("server on: odds2");
    getOdd2();
    const job2 = new CronJob(process.env.UPCOMIN_TIME as string, () => {
      getOdd2();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job2.start();
  } catch (error) {
    console.log(`odds2 server error`, error);
  }
};

export const Odds3 = () => {
  try {
    console.log("server on: odds3");
    getOdd3();
    const job3 = new CronJob(process.env.PRE_TIME as string, () => {
      getOdd3();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job3.start();
  } catch (error) {
    console.log(`odds3 server error`, error);
  }
};

export const Ends1 = () => {
  try {
    console.log("server on: ends1");
    getEnds1();
    const job1 = new CronJob(process.env.LIVE_TIME as string, () => {
      getEnds1();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job1.start();
  } catch (error) {
    console.log(`ends1 server error`, error);
  }
};

export const Ends2 = () => {
  try {
    console.log("server on: ends2");
    getEnds2();
    const job2 = new CronJob(process.env.UPCOMIN_TIME as string, () => {
      getEnds2();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job2.start();
  } catch (error) {
    console.log(`ends2 server error`, error);
  }
};

export const Ends3 = () => {
  try {
    console.log("server on: ends3");
    getEnds3();
    const job3 = new CronJob(process.env.PRE_TIME as string, () => {
      getEnds3();
      console.log(
        moment().format("YYYY-MM-DD hh:mm:ss"),
        count,
        ecount,
        ecount1,
        scount
      );
    });
    job3.start();
  } catch (error) {
    console.log(`ends3 server error`, error);
  }
};

export const getLeaguePage = (sport_id: number) => {
  const options = {
    method: "GET",
    url: process.env.LEAGUE_ENDPOINT as string,
    qs: { token, sport_id, skip_esports: "Esports" },
    headers: { "Content-Type": "application/json" },
    body: { page: 1, skip_markets: 1 },
    json: true,
  };
  request(options, (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      const data = body;
      if (!data || !data?.pager) return console.log(data);
      const pager = data.pager;
      const page = Math.ceil(pager.total / pager.per_page);
      for (let i = 0; i < page; i++) {
        getLeague(sport_id, i + 1);
      }
    }
  });
};

export const getEndedDate = (event_id: number) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "GET",
      url: process.env.ENDED_ENDPOINT as string,
      headers: { "Content-Type": "application/json" },
      qs: { token, event_id, skip_esports: "Esports" },
      json: true,
    };
    request(options, async (error: any, response: any, body: any) => {
      if (error) {
        reject(error);
      } else {
        if (body && body.success && body.results.length) {
          const result = body.results[0];
          let data = {} as any;
          if (result.time_status) {
            data.time_status = Number(result.time_status);
          }
          if (result.time) {
            data.time = Number(result.time);
          }
          if (result.scores) {
            data.scores = result.scores;
          }
          if (result.events) {
            data.events = result.events;
          }
          if (result.extra) {
            data.extra = result.extra;
          }
          if (result.extra) {
            data.extra = result.extra;
          }
          if (result.stats) {
            data.stats = result.stats;
          }
          if (result.ss) {
            data.ss = result.ss;
          }
          try {
            await SportsEndMatchs.updateOne({ id: Number(result.id) }, data);
          } catch (error) {
            reject(error);
          }
          resolve(result);
        } else {
          reject(body);
        }
      }
    });
  });
};

export const getEndedEvents = (event_id: string) => {
  const options = {
    method: "GET",
    url: process.env.ENDED_ENDPOINT as string,
    headers: { "Content-Type": "application/json" },
    qs: { token, event_id, skip_esports: "Esports" },
    json: true,
  };
  request(options, async (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      if (body && body.success && body.results.length) {
        const results = body.results;
        for (const i in results) {
          await updateEndedEvents(results[i]);
        }
      }
    }
  });
};

const getEvents1 = async () => {
  const sportslist = await SportsLists.find({ status: true });
  for (const key in sportslist) {
    getInplayPage(sportslist[key].SportId);
  }
};

const getEvents2 = async () => {
  const sportslist = await SportsLists.find({ status: true });
  for (const key in sportslist) {
    await getUpcomingPage(sportslist[key].SportId, moment().format("YYYYMMDD"));
  }
};

const thereDaysSports = [1, 18, 13, 92, 151];

const getEvents3 = async () => {
  const sportslist = await SportsLists.find({ status: true });
  for (const key in sportslist) {
    await getUpcomingPage(
      sportslist[key].SportId,
      moment().add(1, "days").format("YYYYMMDD")
    );
    await getUpcomingPage(
      sportslist[key].SportId,
      moment().add(2, "days").format("YYYYMMDD")
    );
    await getUpcomingPage(
      sportslist[key].SportId,
      moment().add(3, "days").format("YYYYMMDD")
    );
    if (thereDaysSports.indexOf(sportslist[key].SportId) === -1) {
      await getUpcomingPage(
        sportslist[key].SportId,
        moment().add(4, "days").format("YYYYMMDD")
      );
      await getUpcomingPage(
        sportslist[key].SportId,
        moment().add(5, "days").format("YYYYMMDD")
      );
      await getUpcomingPage(
        sportslist[key].SportId,
        moment().add(6, "days").format("YYYYMMDD")
      );
      await getUpcomingPage(
        sportslist[key].SportId,
        moment().add(7, "days").format("YYYYMMDD")
      );
    }
  }
};

const getOdd1 = async () => {
  const sportsmatchs = await SportsMatchs.aggregate([
    {
      $match: {
        time_status: 1,
      },
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "sport_id",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $unwind: "$sport",
    },
    {
      $match: {
        "sport.status": true,
        "sport.live": true,
      },
    },
  ]);
  for (const key in sportsmatchs) {
    await getOdds(sportsmatchs[key].id, true);
  }
};

const getOdd2 = async () => {
  const lte = Math.floor(moment().add(1, "days").valueOf() / 1000);
  const sportsmatchs = await SportsMatchs.aggregate([
    {
      $match: {
        time_status: 0,
        time: { $lte: lte },
      },
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "sport_id",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $unwind: "$sport",
    },
    {
      $match: {
        "sport.status": true,
        "sport.upcoming": true,
      },
    },
  ]);
  for (const key in sportsmatchs) {
    await getOdds(sportsmatchs[key].id, false);
  }
};

const getOdd3 = async () => {
  const gte = Math.floor(moment().add(1, "days").valueOf() / 1000);
  const sportsmatchs = await SportsMatchs.aggregate([
    {
      $match: {
        time_status: 0,
        time: { $gte: gte },
      },
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "sport_id",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $unwind: "$sport",
    },
    {
      $match: {
        "sport.status": true,
        "sport.upcoming": true,
      },
    },
  ]);
  for (const key in sportsmatchs) {
    await getOdds(sportsmatchs[key].id, false, 100);
  }
};

const getEnds1 = async () => {
  const sportsmatchs = await SportsMatchs.find({ time_status: 1 }).select({
    id: 1,
    _id: 0,
  });
  const matchIds = sportsmatchs.map((e) => e.id);
  const id_count = 10;
  let pages = Math.ceil(matchIds.length / id_count);
  let sendEventIds = [] as any;
  for (let i = 0; i < pages; i++) {
    let matchId = [] as any;
    if (i === 0) {
      matchId = matchIds.slice(0, i + 1 * id_count);
    } else {
      matchId = matchIds.slice(i * id_count, (i + 1) * id_count);
    }
    sendEventIds.push(matchId.join(","));
  }
  for (let i in sendEventIds) {
    getEndedEvents(sendEventIds[i]);
  }
};

const getEnds2 = async () => {
  const lte = Math.floor(moment().add(1, "days").valueOf() / 1000);
  const sportsmatchs = await SportsMatchs.find({
    time_status: { $ne: 1 },
    time: { $lte: lte },
  }).select({ id: 1, _id: 0 });
  const matchIds = sportsmatchs.map((e) => e.id);
  const id_count = 10;
  let pages = Math.ceil(matchIds.length / id_count);
  let sendEventIds = [] as any;
  for (let i = 0; i < pages; i++) {
    let matchId = [] as any;
    if (i === 0) {
      matchId = matchIds.slice(0, i + 1 * id_count);
    } else {
      matchId = matchIds.slice(i * id_count, (i + 1) * id_count);
    }
    sendEventIds.push(matchId.join(","));
  }
  for (let i in sendEventIds) {
    getEndedEvents(sendEventIds[i]);
  }
};

const getEnds3 = async () => {
  const gte = Math.floor(moment().add(1, "days").valueOf() / 1000);
  const sportsmatchs = await SportsMatchs.find({
    time_status: { $ne: 1 },
    time: { $gte: gte },
  }).select({ id: 1, _id: 0 });
  const matchIds = sportsmatchs.map((e) => e.id);
  const id_count = 10;
  let pages = Math.ceil(matchIds.length / id_count);
  let sendEventIds = [] as any;
  for (let i = 0; i < pages; i++) {
    let matchId = [] as any;
    if (i === 0) {
      matchId = matchIds.slice(0, i + 1 * id_count);
    } else {
      matchId = matchIds.slice(i * id_count, (i + 1) * id_count);
    }
    sendEventIds.push(matchId.join(","));
  }
  for (let i in sendEventIds) {
    getEndedEvents(sendEventIds[i]);
  }
};

export const getEnds = async () => {
  const sportsmatchs = await SportsBetting.aggregate([
    { $match: { status: "BET" } },
    { $group: { _id: "$eventId" } },
  ]);
  const matchIds = sportsmatchs.map((e) => e._id);
  const id_count = 10;
  let pages = Math.ceil(matchIds.length / id_count);
  let sendEventIds = [] as any;
  for (let i = 0; i < pages; i++) {
    let matchId = [] as any;
    if (i === 0) {
      matchId = matchIds.slice(0, i + 1 * id_count);
    } else {
      matchId = matchIds.slice(i * id_count, (i + 1) * id_count);
    }
    sendEventIds.push(matchId.join(","));
  }
  for (let i in sendEventIds) {
    getEndedEvents(sendEventIds[i]);
  }
};

export const filterOdds = async (data: any) => {
  return new Promise(async (resolve, reject) => {
    let odds = {} as any;
    for (const i in data) {
      if (data[i] && data[i].length) {
        odds[i] = data[i].sort(
          (a: any, b: any) => Number(b.add_time) - Number(a.add_time)
        )[0];
      }
    }
    resolve(odds);
  });
};

const filterLiveOdds = async (odds: any, oldOdds: any) => {
  return new Promise(async (resolve, reject) => {
    if (!odds) {
      resolve({});
    }
    for (const i in odds) {
      if (!oldOdds) {
        odds[i].notUpdate = 0;
      } else {
        try {
          let notUpdate =
            oldOdds[i] && oldOdds[i] && oldOdds[i]?.notUpdate
              ? oldOdds[i].notUpdate
              : 0;
          if (odds[i]?.time_str && odds[i].time_str != oldOdds[i].time_str) {
            notUpdate = 0;
          } else if (
            odds[i]?.add_time &&
            odds[i].add_time != oldOdds[i].add_time
          ) {
            notUpdate = 0;
          } else {
            notUpdate++;
          }
          odds[i].notUpdate = notUpdate;
        } catch (error) {
          odds[i].notUpdate = 0;
        }
      }
    }
    resolve(odds);
  });
};

const getOdds = (event_id: number, isLive: boolean, time = 20) => {
  return new Promise(async (resolve, reject) => {
    if (event_id == 0) return resolve("error");
    setTimeout(() => {
      resolve(event_id);
    }, time);
    const options = {
      method: "GET",
      url: process.env.ODDS_ENDPOINT as string,
      headers: { "Content-Type": "application/json" },
      qs: { event_id, token, skip_esports: "Esports" },
      json: true,
    };
    request(options, async (error: any, response: any, body: any) => {
      if (error) {
        ecount++;
      } else {
        count++;
        if (body && body.success && body.results && body.results.odds) {
          try {
            let newOdds = await filterOdds(body.results.odds);
            if (isLive) {
              const sportsMatchs = await SportsMatchs.findOne({ id: event_id });
              const odds = await filterLiveOdds(newOdds, sportsMatchs?.odds);
              await SportsMatchs.updateOne({ id: event_id }, { odds });
            } else {
              await SportsMatchs.updateOne({ id: event_id }, { odds: newOdds });
            }
            scount++;
          } catch (error) {
            console.log(`getOdds update error`, error);
            ecount1++;
          }
        }
      }
    });
  });
};

const getLeague = (sport_id: number, page: number) => {
  const options = {
    method: "GET",
    url: process.env.LEAGUE_ENDPOINT as string,
    headers: { "Content-Type": "application/json" },
    qs: { token, sport_id, skip_esports: "Esports" },
    body: { page },
    json: true,
  };
  request(options, async (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      if (body && body.success && body.results.length) {
        const results = body.results;
        for (const i in results) {
          let result = results[i];
          result.sport_id = sport_id;
          try {
            await SportsLeagues.updateOne({ id: result.id }, result, {
              upsert: true,
            });
          } catch (error) {
            console.log("getLeague => update", error);
          }
        }
      }
    }
  });
};

const getInplayPage = (sport_id: number) => {
  const options = {
    method: "GET",
    url: process.env.LIVE_ENDPOINT as string,
    qs: { token, sport_id, skip_esports: "Esports" },
    headers: { "Content-Type": "application/json" },
    body: { page: 1, skip_markets: 1 },
    json: true,
  };
  request(options, (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      const data = body;
      if (!data || !data?.pager) return console.log(data);
      const pager = data.pager;
      const page = Math.ceil(pager.total / pager.per_page);
      for (let i = 0; i < page; i++) {
        getInplayEvents(sport_id, i + 1);
      }
    }
  });
};

const getInplayEvents = (sport_id: number, page: number) => {
  const options = {
    method: "GET",
    url: process.env.LIVE_ENDPOINT as string,
    headers: { "Content-Type": "application/json" },
    qs: { token, sport_id, skip_esports: "Esports" },
    body: { page },
    json: true,
  };
  request(options, async (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      if (body && body.success && body.results.length) {
        const results = body.results;
        for (const i in results) {
          const result = results[i];
          if (
            result.away &&
            result.home &&
            result.time &&
            result.time_status !== 2 &&
            result.time_status !== 3
          ) {
            try {
              const date = moment().add(7, "days").valueOf();
              const time = new Date(result.time * 1000).valueOf();
              const sportsLeagues = await SportsLeagues.findOne({
                id: result.league.id,
              });
              if (sportsLeagues?.status && time < date) {
                const exists = await SportsFixMatchs.findOne({ id: result.id });
                if (!exists) {
                  await SportsMatchs.updateOne({ id: result.id }, result, {
                    upsert: true,
                  });
                  scount++;
                }
              }
            } catch (error) {
              ecount1++;
            }
          } else if (
            result.time &&
            result.sport_id === "2" &&
            result.time_status !== 2 &&
            result.time_status !== 3
          ) {
            try {
              const date = moment().add(7, "days").valueOf();
              const time = new Date(result.time * 1000).valueOf();
              const sportsLeagues = await SportsLeagues.findOne({
                id: result.league.id,
              });
              if (sportsLeagues?.status && time < date) {
                const exists = await SportsFixMatchs.findOne({ id: result.id });
                if (!exists) {
                  await SportsMatchs.updateOne({ id: result.id }, result, {
                    upsert: true,
                  });
                  scount++;
                }
              }
            } catch (error) {
              ecount1++;
            }
          }
        }
      }
    }
  });
};

const getUpcomingPage = (sport_id: number, day: string) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve("success");
    }, 8500);
    const options = {
      method: "GET",
      url: process.env.PRE_ENDPOINT as string,
      qs: { token, sport_id, skip_esports: "Esports" },
      headers: { "Content-Type": "application/json" },
      body: { page: 1, skip_markets: 1, day },
      json: true,
    };
    request(options, (error: any, response: any, body: any) => {
      if (error) {
        ecount++;
      } else {
        count++;
        const data = body;
        if (!data || !data?.pager) return console.log(data);
        const pager = data.pager;
        const page = Math.ceil(pager.total / pager.per_page);
        for (let i = 0; i < page; i++) {
          getUpcomingEvents(sport_id, i + 1, day);
        }
      }
    });
  });
};

const getUpcomingEvents = (sport_id: number, page: number, day: string) => {
  const options = {
    method: "GET",
    url: process.env.PRE_ENDPOINT as string,
    headers: { "Content-Type": "application/json" },
    qs: { token, sport_id, skip_esports: "Esports" },
    body: { page, day },
    json: true,
  };
  request(options, async (error: any, response: any, body: any) => {
    if (error) {
      ecount++;
    } else {
      count++;
      if (body && body.success && body.results.length) {
        const results = body.results;
        for (const i in results) {
          const result = results[i];
          if (
            result.away &&
            result.home &&
            result.time &&
            result.time_status != 2 &&
            result.time_status != 3
          ) {
            try {
              const date = moment().add(7, "days").valueOf();
              const time = new Date(result.time * 1000).valueOf();
              const sportsLeagues = await SportsLeagues.findOne({
                id: result.league.id,
              });
              if (sportsLeagues?.status && time < date) {
                const exists = await SportsFixMatchs.findOne({ id: result.id });
                if (!exists) {
                  await SportsMatchs.updateOne(
                    { time_status: { $ne: 3 }, id: result.id },
                    result,
                    { upsert: true }
                  );
                }
              }
              scount++;
            } catch (error) {
              ecount1++;
            }
          } else if (
            result.time &&
            result.sport_id === "2" &&
            result.time_status != 2 &&
            result.time_status != 3
          ) {
            try {
              const date = moment().add(7, "days").valueOf();
              const time = new Date(result.time * 1000).valueOf();
              const sportsLeagues = await SportsLeagues.findOne({
                id: result.league.id,
              });
              if (sportsLeagues?.status && time < date) {
                const exists = await SportsFixMatchs.findOne({ id: result.id });
                if (!exists) {
                  await SportsMatchs.updateOne(
                    { time_status: { $ne: 3 }, id: result.id },
                    result,
                    { upsert: true }
                  );
                }
              }
              scount++;
            } catch (error) {
              ecount1++;
            }
          }
        }
      }
    }
  });
};

const checkBet = async (eventId: number) => {
  const isbet = await SportsBetting.findOne({ eventId, status: "BET" });
  if (isbet) return true;
  return false;
};

const checkFix = async (id: number) => {
  const is = await SportsFixMatchs.findOne({ id });
  if (is) return true;
  return false;
};

const updateEndedEvents = (result: any) => {
  return new Promise(async (resolve, reject) => {
    if (!result) return resolve("error");
    setTimeout(() => {
      resolve("success");
    }, 20);
    try {
      const time_status = Number(result.time_status);
      const sportslist: any = await SportsLists.findOne({
        SportId: Number(result.sport_id),
      });
      if (!result.id && !sportslist) {
        return console.log(`result.id => null ${result.id}`);
      } else if (time_status === 0 || time_status === 1) {
        const id = Number(result.id);
        const exists = await checkFix(id);
        if (exists) {
          await SportsFixMatchs.deleteOne({ id });
          await SportsMatchs.updateOne({ id }, result, { upsert: true });
        } else {
          await SportsMatchs.updateOne({ id }, result);
        }
      } else {
        const id = Number(result.id);
        const isbet = await checkBet(id);
        await SportsMatchs.deleteOne({ id });
        const exists = await checkFix(id);
        if (!isbet || (exists && time_status !== 3)) {
          return;
        } else if (time_status === 2) {
          await SportsFixMatchs.updateOne({ id }, result, { upsert: true });
          scount++;
        } else if (time_status === 3) {
          if (result.ss == null) {
            await SportsFixMatchs.updateOne({ id }, result, { upsert: true });
            scount++;
          } else {
            const isDraw = result.ss.split("-")[0] === result.ss.split("-")[1];
            if (isDraw && !sportslist.draw) {
              await SportsFixMatchs.updateOne({ id }, result, { upsert: true });
              scount++;
            } else if (time_status === 3) {
              if (exists) {
                await SportsFixMatchs.deleteOne({ id });
              }
              await SportsEndMatchs.updateOne({ id }, result, { upsert: true });
              scount++;
            }
          }
        } else if (
          time_status === 4 ||
          time_status === 5 ||
          time_status === 6 ||
          time_status === 7 ||
          time_status === 8 ||
          time_status === 9 ||
          time_status === 10 ||
          time_status === 99
        ) {
          await SportsFixMatchs.updateOne({ id }, result, { upsert: true });
          scount++;
        } else {
          console.log(`updateEndedEvents result`, result);
        }
      }
    } catch (error) {
      console.log(`updateEndedEvents error`, error);
      ecount1++;
    }
  });
};
