import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      mobileNumber: {
        type: Number,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      employeeRole: {
        type: String,
        required: true,
      },
      profilepic: {
        type: String
      }
  },
  {
    timestamps: true,
  }
);

export const Employee = mongoose.model("Employee", employeeSchema);
