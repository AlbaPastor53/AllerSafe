const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true
    },
    departure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departure",
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

cartItemSchema.index({ cart: 1, departure: 1 }, { unique: true });

cartItemSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

cartItemSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("CartItem", cartItemSchema);
