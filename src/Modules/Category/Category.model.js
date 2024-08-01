import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoriesTitle: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
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

export const Category = mongoose.model("Category", categorySchema);
