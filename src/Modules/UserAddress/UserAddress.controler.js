import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { UserAddress } from "./UserAddress.model.js";

// Create a new address
const createAddress = asyncHandler(async (req, res) => {
  // Get address details from frontend
  const {
    userId,
    fullName,
    phoneNumber,
    streetAddress,
    city,
    state,
    postalCode,
    country,
    addressType,
  } = req.body;

  // Validation - Check if required fields are not empty
  if (
    [
      userId,
      fullName,
      phoneNumber,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      addressType,
    ].some((field) => !field)
  ) {
    throw new ApiError(400, "All fields are required except 'isDefault'");
  }

  // Validate address type
  if (!["Home", "Office"].includes(addressType)) {
    throw new ApiError(400, "Address type must be either 'home' or 'office'");
  }

  // Create the address object
  const address = await UserAddress.create({
    userId,
    fullName,
    phoneNumber,
    streetAddress,
    city,
    state,
    postalCode,
    country,
    addressType,
  });

  if (!address) {
    throw new ApiError(500, "Something went wrong while creating the address");
  }

  return res.status(201).json({
    success: true,
    data: address,
    message: "Address created successfully",
  });
});

const getAddresses = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  // Validation - Check if userId is provided
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Find addresses by userId
  const addresses = await UserAddress.find({ userId });

  // Check if addresses are found
  if (!addresses.length) {
    throw new ApiError(404, "No addresses found for this user");
  }

  return res.status(200).json({
    success: true,
    data: addresses,
  });
});
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.query;
  const {
    fullName,
    phoneNumber,
    streetAddress,
    city,
    state,
    postalCode,
    country,
    isDefault,
    addressType,
  } = req.body;

  // Validation - Check if addressId is provided
  if (!addressId) {
    throw new ApiError(400, "Address ID is required");
  }

  // Validate address type if provided
  if (addressType && !["Home", "Office"].includes(addressType)) {
    throw new ApiError(400, "Address type must be either 'home' or 'office'");
  }

  // Find the address by addressId
  const address = await UserAddress.findById(addressId);

  // Check if address is found
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Update the address details
  address.fullName = fullName || address.fullName;
  address.phoneNumber = phoneNumber || address.phoneNumber;
  address.streetAddress = streetAddress || address.streetAddress;
  address.city = city || address.city;
  address.state = state || address.state;
  address.postalCode = postalCode || address.postalCode;
  address.country = country || address.country;
  address.addressType = addressType || address.addressType;

  // Save the updated address
  const updatedAddress = await address.save();

  return res.status(200).json({
    success: true,
    data: updatedAddress,
    message: "Address updated successfully",
  });
});

// Delete an address
const deleteAddress = asyncHandler(async (req, res) => {
  // Get address ID from request params
  const { id } = req.query;

  // Validation - Check if address ID is provided
  if (!id) {
    throw new ApiError(400, "Address ID is required");
  }

  // Find and delete the address
  const address = await UserAddress.findByIdAndDelete(id);

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

export { createAddress, getAddresses, updateAddress, deleteAddress };
