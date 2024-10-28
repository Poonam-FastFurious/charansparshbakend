import mongoose from "mongoose";

const headerCategorySchema = new mongoose.Schema(
  {
    categoriesTitle: {
      type: String,
      required: true,
    },
    image: {
      type: [String], // Array of image URLs
    },
    content: {
      type: String,
      required: true,
    },
    audio: {
      type: String, // URL or path to audio file
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    mainHeading: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HeaderCategory = mongoose.model(
  "HeaderCategory",
  headerCategorySchema
);
