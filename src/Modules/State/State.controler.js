import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { State } from "./State.model.js";
// Adjust the path as per your structure

const createState = asyncHandler(async (req, res) => {
  try {
    // Check if the request body exists
    if (!req.body) {
      throw new ApiError(400, "Request body is missing or empty");
    }

    // Extract State and status from request body
    const { State: stateName, status } = req.body;

    // Validate required fields
    if (!stateName?.trim()) {
      throw new ApiError(400, "State name is required");
    }

    // Check if a state with the same name already exists
    const existingState = await State.findOne({ State: stateName });
    if (existingState) {
      throw new ApiError(409, "State with the same name already exists");
    }

    // Create the new state
    const state = await State.create({
      State: stateName,
      status: status || "active", // Default status is active if not provided
    });

    // Return the created state as a response
    const { _id: _, ...createdState } = state.toObject();
    return res
      .status(201)
      .json(new ApiResponse(201, createdState, "State created successfully"));
  } catch (error) {
    console.error("Error during state creation:", error);

    // Handle known ApiError cases
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
const getState = asyncHandler(async (req, res) => {
  // Fetch all coupons
  const state = await State.find();

  return res.json({
    success: true,
    data: state,
  });
});
const deleteState = asyncHandler(async (req, res) => {
  try {
    // Extract state ID from request params
    const { id } = req.query;

    // Validate the provided ID
    if (!id) {
      throw new ApiError(400, "State ID is required");
    }

    // Find and delete the state by ID
    const state = await State.findByIdAndDelete(id);

    // Check if the state was found and deleted
    if (!state) {
      throw new ApiError(404, "State not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "State deleted successfully"));
  } catch (error) {
    console.error("Error deleting state:", error);

    // Handle known ApiError cases
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});
const updateState = asyncHandler(async (req, res) => {
  try {
    // Extract state ID from request params
    const { id } = req.body;

    // Extract fields to update from request body
    const { State: stateName, status } = req.body;

    // Validate required fields
    if (!id) {
      throw new ApiError(400, "State ID is required");
    }

    if (!stateName?.trim() && status === undefined) {
      throw new ApiError(
        400,
        "At least one field (State name or status) is required to update"
      );
    }

    // Find and update the state by ID
    const updatedState = await State.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(stateName && { State: stateName }),
          ...(status !== undefined && { status }),
        },
      },
      { new: true } // Return the updated document
    );

    // Check if the state was found and updated
    if (!updatedState) {
      throw new ApiError(404, "State not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedState, "State updated successfully"));
  } catch (error) {
    console.error("Error updating state:", error);

    // Handle known ApiError cases
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    // Handle unexpected errors
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export { createState, getState, deleteState, updateState };
