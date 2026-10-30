const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    biography: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
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
      enum: ["active", "inactive", "suspended"],
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

hostSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

hostSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("Host", hostSchema);
