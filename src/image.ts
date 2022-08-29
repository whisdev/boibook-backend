import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import axios from "axios";
import { SportsLists } from "./models";
const config = require("../config");
const token = process.env.SPORTSBOOK_APIKEY;
let count = 0;

var fs = require("fs"),
  http = require("http"),
  https = require("https");

var Stream = require("stream").Transform;

const downloadImageFromURL = (url: string, filename: string) =>
  new Promise((resolve, reject) => {
    var client = http;
    if (url.toString().indexOf("https") === 0) {
      client = https;
    }
    client
      .request(url, function (response: any) {
        var data = new Stream();

        response.on("data", function (chunk: any) {
          data.push(chunk);
        });

        response.on("end", function () {
          console.log(filename);
          fs.writeFileSync(`${config.DIR}/teams-1/${filename}`, data.read());
          resolve(true);
        });
      })
      .end();
  });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getTeamsPage = async (sport_id: number) => {
  const options = {
    method: "GET",
    url: "https://api.b365api.com/v1/team",
    params: { token, sport_id, page: 1 },
  };
  const { data } = await axios.request(options);
  const pager = data.pager;
  const page = Math.ceil(pager.total / pager.per_page);
  for (let i = 0; i < page; i++) {
    await getTeams(sport_id, i + 1);
  }
};

const getTeams = async (sport_id: number, page: number) => {
  const options = {
    method: "GET",
    url: "https://api.b365api.com/v1/team",
    params: { token, sport_id, page },
  };
  const { data } = await axios.request(options);
  for (const i in data.results) {
    count++;
    let result = data.results[i];
    if (result?.image_id) {
      await downloadImageFromURL(
        `https://assets.b365api.com/images/team/b/${result.image_id}.png`,
        `${result.image_id}.png`
      );
    }
  }
};

export const updateTeams = async () => {
  const sportslist = await SportsLists.find({ status: true });
  for (const key in sportslist) {
    console.log(sportslist[key].SportId);
    await getTeamsPage(sportslist[key].SportId);
    console.log(count);
  }
};

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    updateTeams();
  });
} catch (error) {
  console.log(`Matchs`, error);
}
