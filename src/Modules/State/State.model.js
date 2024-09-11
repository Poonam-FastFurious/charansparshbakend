import mongoose from "mongoose";

const StateSchema = new mongoose.Schema(
  {
    State: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const State = mongoose.model("State", StateSchema);
