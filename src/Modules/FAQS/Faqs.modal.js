import mongoose from "mongoose";

// Define FAQ schema
const faqSchema = new mongoose.Schema({
      faq: {
            type: String,
            required: true
      }
},
      { timestamps: true });

// Create FAQ model
export const FAQ = mongoose.model('FAQ', faqSchema);


