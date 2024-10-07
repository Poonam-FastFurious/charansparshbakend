import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoriesTitle: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    image: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isHeaderCategory: {
      type: Boolean,
      default: false,
    },
    isCollectionCategory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model("Category", categorySchema);
