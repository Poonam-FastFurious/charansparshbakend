import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    Type: {
        type: String,
        required: true,
      },
      Title: {
        type: String,
        required: true,
      },
      Detail: {
        type: String,
        required: true,
      }
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
