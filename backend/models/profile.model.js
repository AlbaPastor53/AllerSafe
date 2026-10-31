const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    first_name: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    last_name: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    birth_date: {
      type: Date,
      default: null
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    postal_code: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ""
    },
    avatar_url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    allergies: {
      type: [String],
      default: []
    },
    dietary_restrictions: {
      type: [String],
      default: []
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

// Garantiza la relación 1:1 entre User y Profile mientras el perfil esté activo.
profileSchema.index(
  { user_id: 1 },
  { unique: true, partialFilterExpression: { deleted_at: null } }
);

profileSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

profileSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model("Profile", profileSchema);
