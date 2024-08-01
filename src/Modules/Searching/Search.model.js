import mongoose from "mongoose";

const searchDataSchema = new mongoose.Schema({
  searchParam: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SearchData = mongoose.model("SearchData", searchDataSchema);
