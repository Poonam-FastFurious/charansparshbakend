// models/BlogPost.js

import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Main BlogPost schema
const BlogPostSchema = new Schema({
      title: { type: String, required: true },
      content: { type: String, required: true },
      author: { type: String, required: true },
      thumbnail: { type: String }, // Store the URL of the thumbnail image
      gallery: [{ type: String }], // Array to store URLs of gallery images
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
});

export const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
