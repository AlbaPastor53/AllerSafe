const mongoose = require("mongoose");

const eventImageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 160,
      default: ""
    },
    position: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isCover: {
      type: Boolean,
      default: false
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
      enum: ["active", "inactive"],
      default: "active",
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

eventImageSchema.index({ event: 1, position: 1 });

eventImageSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

eventImageSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("EventImage", eventImageSchema);
