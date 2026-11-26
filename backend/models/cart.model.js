const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    total_products: {
      type: Number,
      default: 0,
      min: 0
    },
    total_price: {
      type: Number,
      default: 0,
      min: 0
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

cartSchema.index({ user: 1 }, { unique: true });

cartSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

cartSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

cartSchema.virtual("items", {
  ref: "CartItem",
  localField: "_id",
  foreignField: "cart"
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
