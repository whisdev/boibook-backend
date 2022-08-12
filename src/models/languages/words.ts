import { Schema, model } from "mongoose";

const languageWordSchema = new Schema(
  {
    key: {
      type: String,
    },
    af: {
      type: String,
    },
    am: {
      type: String,
    },
    ar: {
      type: String,
    },
    az: {
      type: String,
    },
    be: {
      type: String,
    },
    bg: {
      type: String,
    },
    bn: {
      type: String,
    },
    bs: {
      type: String,
    },
    ca: {
      type: String,
    },
    cs: {
      type: String,
    },
    cy: {
      type: String,
    },
    da: {
      type: String,
    },
    de: {
      type: String,
    },
    dv: {
      type: String,
    },
    en: {
      type: String,
    },
    es: {
      type: String,
    },
    et: {
      type: String,
    },
    eu: {
      type: String,
    },
    fa: {
      type: String,
    },
    fi: {
      type: String,
    },
    fr: {
      type: String,
    },
    gl: {
      type: String,
    },
    el: {
      type: String,
    },
    ha: {
      type: String,
    },
    he: {
      type: String,
    },
    hi: {
      type: String,
    },
    hr: {
      type: String,
    },
    hu: {
      type: String,
    },
    hy: {
      type: String,
    },
    is: {
      type: String,
    },
    it: {
      type: String,
    },
    id: {
      type: String,
    },
    ja: {
      type: String,
    },
    ka: {
      type: String,
    },
    kk: {
      type: String,
    },
    km: {
      type: String,
    },
    ko: {
      type: String,
    },
    ku: {
      type: String,
    },
    ky: {
      type: String,
    },
    lt: {
      type: String,
    },
    lv: {
      type: String,
    },
    mk: {
      type: String,
    },
    ml: {
      type: String,
    },
    mn: {
      type: String,
    },
    ms: {
      type: String,
    },
    nb: {
      type: String,
    },
    nl: {
      type: String,
    },
    nn: {
      type: String,
    },
    no: {
      type: String,
    },
    pl: {
      type: String,
    },
    ps: {
      type: String,
    },
    pt: {
      type: String,
    },
    ro: {
      type: String,
    },
    ru: {
      type: String,
    },
    sd: {
      type: String,
    },
    sk: {
      type: String,
    },
    sl: {
      type: String,
    },
    so: {
      type: String,
    },
    sq: {
      type: String,
    },
    sr: {
      type: String,
    },
    sv: {
      type: String,
    },
    sw: {
      type: String,
    },
    ta: {
      type: String,
    },
    tg: {
      type: String,
    },
    th: {
      type: String,
    },
    tr: {
      type: String,
    },
    tt: {
      type: String,
    },
    ug: {
      type: String,
    },
    uk: {
      type: String,
    },
    ur: {
      type: String,
    },
    uz: {
      type: String,
    },
    zh: {
      type: String,
    },
    vi: {
      type: String,
    },
  },
  { timestamps: true }
);

export const LanguageWord = model("languagewords", languageWordSchema);
