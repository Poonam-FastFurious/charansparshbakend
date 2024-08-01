import mongoose from "mongoose";

const employeeRoleSchema = new mongoose.Schema(
  {
    roleName: {
        type: String,
        required: true,
      },
      menuPermission: {
        type: String,
        required: true,
      }
  },
  {
    timestamps: true,
  }
);

export const EmployeeRole = mongoose.model("EmployeeRole", employeeRoleSchema);
