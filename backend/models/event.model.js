const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["alergias", "cocina", "reposteria", "nutricion", "seguridad"]
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
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

eventSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

eventSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("Event", eventSchema);
