import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { EmployeeRole } from "./EmployeeRole.model.js";
import { ApiError } from "../../utils/ApiError.js";


const getAllEmployeeRole = asyncHandler(async (req, res) => {
      const employeeRole = await EmployeeRole.find({}).select();
    
      if (!employeeRole) {
        throw new ApiError(404, "No Employee Role found");
      }
    
      return res
        .status(200)
        .json(new ApiResponse(200, employeeRole, "All Employee Role fetched successfully"));
});

  export {
    getAllEmployeeRole
  };