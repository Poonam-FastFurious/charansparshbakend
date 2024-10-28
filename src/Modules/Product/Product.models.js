import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    stocks: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: String,
      trim: true,
    },
    cutPrice: {
      type: Number,
      min: 0,
    },
    IsApproved: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true, // Reference the Vendor model
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    youtubeVideoLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]{11}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid YouTube URL`,
      },
    },
    thumbnail: [
      {
        type: String,
        trim: true,
      },
    ],
    vendor: {
      id: {
        type: mongoose.Schema.Types.ObjectId, // Assuming vendors are stored in a separate collection
        ref: "Vendor", // Reference the Vendor model
        required: true,
      },
      name: {
        type: String,
      },
    },
  },

  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
