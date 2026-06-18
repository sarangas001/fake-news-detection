import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    token: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.index(
 { expiresAt: 1 },
 { expireAfterSeconds: 0 }
);

const RefreshToken = model("RefreshToken", refreshTokenSchema);

export default RefreshToken;