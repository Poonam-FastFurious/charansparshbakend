import mongoose from "mongoose";

const addonSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true
      },
      price: {
            type: Number,
            required: true
      },
      status: {
            type: String,
            enum: ['active', 'inactive'], // assuming status can be either active or inactive
            default: 'active' // default status is active
      }
});

export const Addon = mongoose.model('Addon', addonSchema);


