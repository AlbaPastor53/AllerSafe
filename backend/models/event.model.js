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
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true
        }
      ],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Debe asignar al menos una categoría."
      },
      required: true
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true
    },
    classNumber: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "El campo time debe tener formato HH:mm"]
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true
    },
    isActive: {
      type: Boolean,
      default: false,
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
