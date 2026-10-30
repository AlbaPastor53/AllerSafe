const mongoose = require("mongoose");

const departureSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    start_datetime: {
      type: Date,
      required: true
    },
    end_datetime: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    booked_participants: {
      type: Number,
      default: 0,
      min: 0
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ["scheduled", "full", "cancelled", "completed"],
      default: "scheduled",
      index: true
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    deleted_at: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    versionKey: false
  }
);

departureSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

departureSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("Departure", departureSchema);
