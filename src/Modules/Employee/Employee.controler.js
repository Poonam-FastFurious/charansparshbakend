import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Employee } from "./Employee.model.js";
import { ApiError } from "../../utils/ApiError.js";

const CreateEmployee = asyncHandler(async (req, res) => {
  
    const { name, email, password, mobileNumber, employeeRole } = req.body;

    if ([email, name, password, employeeRole].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedEmployee = await Employee.findOne({
      $or: [{ name }, { email }, { mobileNumber}],
    });
  
    if (existedEmployee) {
      throw new ApiError(409, "Employee with email/username/mobilenumber already exists");
    }

    const imageLocalPath = req.files?.image[0].path;
    let imageUrl;
    if (imageLocalPath) {
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      imageUrl = image.url;
    }
  
    const employee = await Employee.create({
        name,
        email,
        mobileNumber,
        password,
        employeeRole,
        profilepic:imageUrl
    });

    const createdEmployee = await Employee.findById(employee._id).select();
  
    if (!createdEmployee) {
      throw new ApiError(500, "Something went wrong while Creating the Employee");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdEmployee, "Employee Created Successfully"));
  });

const UpdateEmployee = asyncHandler(async (req, res) => {
  
    const { name, email, password, mobileNumber, employeeRole, id } = req.body;

    if ([email, name, password, employeeRole].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const imageLocalPath = req.files?.image[0].path;
    let imageUrl;
    if (imageLocalPath) {
      const image = await uploadOnCloudinary(imageLocalPath);
      if (!image) {
        throw new ApiError(400, "Failed to upload image");
      }
      imageUrl = image.url;
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          email,
          mobileNumber,
          password,
          employeeRole,
          profilepic:imageUrl
        }
    },
    { new: true }).select();

    return res
      .status(201)
      .json(new ApiResponse(200, employee, "Employee Update Successfully"));
  });

const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.body;
  
    if (!id) {
      throw new ApiError(400, "Employee ID is required");
    }
  
    const deletedEmployee = await Employee.findByIdAndDelete(id);
  
    if (!deletedEmployee) {
      throw new ApiError(404, "Employee not found");
    }
  
    return res.status(200).json({
      success: true,
      data: deletedEmployee,
      message: "Employee deleted successfully",
    });
  });

const getAllEmployees = asyncHandler(async (req, res) => {
      const employees = await Employee.find({}).select();
    
      if (!employees) {
        throw new ApiError(404, "No Employees found");
      }
    
      return res
        .status(200)
        .json(new ApiResponse(200, employees, "All Employees fetched successfully"));
});

const getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Employee ID is required");
  }

  const employee = await Employee.findById(id).select("-password");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { employee }, "Employee fetched successfully"));
});

  export {
    CreateEmployee,
    UpdateEmployee,
    deleteEmployee,
    getAllEmployees,
    getEmployee
  };