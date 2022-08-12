import { Schema, model } from "mongoose";

const SportsFixMatchsSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    sport_id: {
      type: Number,
    },
    time: {
      type: Number,
    },
    time_status: {
      type: Number,
    },
    league: {
      id: {
        type: Number,
      },
      name: {
        type: String,
      },
      cc: {
        type: String,
      },
    },
    home: {
      id: {
        type: Number,
      },
      name: {
        type: String,
      },
      image_id: {
        type: Number,
      },
      cc: {
        type: String,
      },
    },
    away: {
      id: {
        type: Number,
      },
      name: {
        type: String,
      },
      image_id: {
        type: Number,
      },
      cc: {
        type: String,
      },
    },
    ss: {
      type: String,
    },

    points: {
      type: String,
    },
    playing_indicator: {
      type: String,
    },
    scores: {
      type: Object,
    },
    stats: {
      type: Object,
    },
    extra: {
      type: Object,
    },
    events: {
      type: Object,
    },
    timer: {
      type: Object,
    },

    has_lineup: {
      type: Number,
    },
    inplay_created_at: {
      type: Number,
    },
    inplay_updated_at: {
      type: Number,
    },
    confirmed_at: {
      type: Number,
    },

    odds: {
      type: Object,
    },

    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SportsFixMatchs = model(
  "sports_fix_matchs",
  SportsFixMatchsSchema
);
