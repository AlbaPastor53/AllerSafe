const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password_hash: {
      type: String,
      required: false,
      select: false
    },
    role: {
      type: String,
      enum: ["Admin", "Client"],
      default: "Client",
      index: true
    },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
      index: true
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
      enum: ["active", "inactive", "blocked"],
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

userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

userSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password_hash;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);
