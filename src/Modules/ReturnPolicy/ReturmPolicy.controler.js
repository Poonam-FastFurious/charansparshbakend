  import { asyncHandler } from "../../utils/asyncHandler.js";

import { ApiError } from "../../utils/ApiError.js";
import { ReturnPolicyModal } from "./ReturnPolicy.modal.js";

const addReturnPolicy = asyncHandler(async (req, res) => {
  // Get return policy details from the request body
  const { ReturnPolicy } = req.body;

  // Validation - Check if required fields are not empty
  if (!ReturnPolicy) {
    throw new ApiError(400, "Return policy is required");
  }

  // Check if return policy already exists
  const existingReturnPolicy = await ReturnPolicyModal.findOne({
    ReturnPolicy,
  });

  if (existingReturnPolicy) {
    throw new ApiError(409, "Return policy already exists");
  }

  // Create the return policy object
  const returnPolicy = await ReturnPolicyModal.create({ ReturnPolicy });

  // Check for return policy creation
  if (!returnPolicy) {
    throw new ApiError(
      500,
      "Something went wrong while creating the return policy"
    );
  }

  return res.status(201).json({
    success: true,
    data: returnPolicy,
    message: "Return policy created successfully",
  });
});
const getReturnPolicy = asyncHandler(async (req, res) => {
  // Retrieve the return policy from the database
  const returnPolicy = await ReturnPolicyModal.findOne();

  // If no return policy is found, return a 404 error
  if (!returnPolicy) {
    throw new ApiError(404, "Return policy not found");
  }

  // Return the return policy data
  return res.status(200).json({
    success: true,
    data: returnPolicy,
    message: "Return policy retrieved successfully",
  });
});
const updateReturnPolicy = asyncHandler(async (req, res) => {
  // Get the return policy ID from the request params and the updated data from the request body
  const { id } = req.body;
  const { ReturnPolicy } = req.body;

  // Validation - Check if required fields are not empty
  if (!ReturnPolicy) {
    throw new ApiError(400, "Return policy is required");
  }

  // Find the return policy by ID and update it with the new data
  const updatedReturnPolicy = await ReturnPolicyModal.findByIdAndUpdate(
    id,
    { ReturnPolicy },
    { new: true, runValidators: true }
  );

  // Check if the return policy exists
  if (!updatedReturnPolicy) {
    throw new ApiError(404, "Return policy not found");
  }

  // Check for successful update
  if (!updatedReturnPolicy) {
    throw new ApiError(
      500,
      "Something went wrong while updating the return policy"
    );
  }

  return res.status(200).json({
    success: true,
    data: updatedReturnPolicy,
    message: "Return policy updated successfully",
  });
});

export { addReturnPolicy, getReturnPolicy, updateReturnPolicy };
