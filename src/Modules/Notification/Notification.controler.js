import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Notification } from "./Notification.model.js";
import { ApiError } from "../../utils/ApiError.js";

const CreateNotification = asyncHandler(async (req, res) => {
  
    const { Type, Title, Detail } = req.body;

    if ([Type, Title, Detail].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedNotification = await Notification.findOne({
      $or: [{ Type }, { Title }, { Detail}],
    });
  
    if (existedNotification) {
      throw new ApiError(409, "Notification with Type/Title/Detail already exists");
    }

    const notification = await Notification.create({
        Type,
        Title,
        Detail
    });

    const createdNotification = await Notification.findById(notification._id).select();
  
    if (!createdNotification) {
      throw new ApiError(500, "Something went wrong while Creating the Notification");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdNotification, "Notification Created Successfully"));
  });

const UpdateNotification = asyncHandler(async (req, res) => {
  
    const { Type, Title, Detail, id } = req.body;

    if ([Type, Title, Detail].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        $set: {
          Type,
          Title,
          Detail
        }
    },
    { new: true }).select();

    return res
      .status(201)
      .json(new ApiResponse(200, notification, "Notification Update Successfully"));
  });

const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.body;
  
    if (!id) {
      throw new ApiError(400, "Notification ID is required");
    }
  
    const deletedNotification = await Notification.findByIdAndDelete(id);
  
    if (!deletedNotification) {
      throw new ApiError(404, "Notification not found");
    }
  
    return res.status(200).json({
      success: true,
      data: deletedNotification,
      message: "Notification deleted successfully",
    });
  });

const getAllNotification = asyncHandler(async (req, res) => {
      const notification = await Notification.find({}).select();
    
      if (!notification) {
        throw new ApiError(404, "No Notification found");
      }
    
      return res
        .status(200)
        .json(new ApiResponse(200, notification, "All Notification fetched successfully"));
});

const getNotification = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Notification ID is required");
  }

  const notification = await Notification.findById(id).select();

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { notification }, "Notification fetched successfully"));
});

  export {
    CreateNotification,
    UpdateNotification,
    deleteNotification,
    getAllNotification,
    getNotification
  };