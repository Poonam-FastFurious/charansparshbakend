// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import { asyncHandler } from "../../utils/asyncHandler.js";

// import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
// import { ApiResponse } from "../../utils/ApiResponse.js";
// import { ApiError } from "../../utils/ApiError.js";
// import { Vendor } from "./vendor.model.js";

// const registerVendor = asyncHandler(async (req, res) => {
//   const { firstName, storeLegalName, PANNumber, MobileNumber } = req.body;

//   if (
//     [firstName, storeLegalName, PANNumber, MobileNumber].some(
//       (field) => field?.trim() === ""
//     )
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const existedVendor = await Vendor.findOne({
//     $or: [{ storeLegalName }, { storeName }],
//   });

//   if (existedVendor) {
//     throw new ApiError(409, "vendorname already exists");
//   }

//   const vendor = await Vendor.create({
//     firstName,
//     storeLegalName,
//     PANNumber,
//     MobileNumber,
//   });

//   const createdVendor = await Vendor.findById(vendor._id).select(
//     "-password -refreshToken"
//   );

//   if (!createdVendor) {
//     throw new ApiError(
//       500,
//       "Something went wrong while registering the vendor"
//     );
//   }

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(200, createdVendor, "Vendor registered Successfully")
//     );
// });

// const getCurrentVendor = asyncHandler(async (req, res) => {
//   return res
//     .status(200)
//     .json(new ApiResponse(200, req.vendor, "Vendor fetched successfully"));
// });
// const getVendorProfile = asyncHandler(async (req, res) => {
//   const { id } = req.query;

//   if (!id) {
//     throw new ApiError(400, "Vendor ID is required");
//   }

//   const vendor = await Vendor.findById(id).select("-password");

//   if (!vendor) {
//     throw new ApiError(404, "Vendor not found");
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, { vendor }, "Vendor profile fetched successfully")
//     );
// });

// const updateVendorDetails = asyncHandler(async (req, res) => {
//   const { fullName, email } = req.body;

//   if (!fullName || !email) {
//     throw new ApiError(400, "All fields are required");
//   }

//   const vendor = await Vendor.findByIdAndUpdate(
//     req.vendor?._id,
//     {
//       $set: {
//         firstName,
//         PANumber,
//         MobileNumber,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, vendor, "Account details updated successfully"));
// });

// const updateStoreLogo = asyncHandler(async (req, res) => {
//   const storeLogoLocalPath = req.file?.path;

//   if (!storeLogoLocalPath) {
//     throw new ApiError(400, "Avatar file is missing");
//   }

//   //TODO: delete old image - assignment

//   const storeLogo = await uploadOnCloudinary(storeLogoLocalPath);

//   if (!avatar.url) {
//     throw new ApiError(400, "Error while uploading on avatar");
//   }

//   const vendor = await Vendor.findByIdAndUpdate(
//     req.vendor?._id,
//     {
//       $set: {
//         storeLogo: storeLogo.url,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, vendor, "Avatar image updated successfully"));
// });
// const updateCoverImage = asyncHandler(async (req, res) => {
//   const coverImageLocalPath = req.file?.path;

//   if (!coverImageLocalPath) {
//     throw new ApiError(400, "Avatar file is missing");
//   }

//   //TODO: delete old image - assignment

//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!coverImage.url) {
//     throw new ApiError(400, "Error while uploading on avatar");
//   }

//   const vendor = await Vendor.findByIdAndUpdate(
//     req.vendor?._id,
//     {
//       $set: {
//         coverImage: coverImage.url,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, vendor, "Avatar image updated successfully"));
// });

// const getAllVendors = asyncHandler(async (req, res) => {
//   const vendors = await Vendor.find({}).select("-password -refreshToken");

//   if (!vendors) {
//     throw new ApiError(404, "No vendors found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, vendors, "All vendors fetched successfully"));
// });

// export {
//   registerVendor,
//   getCurrentVendor,
//   updateVendorDetails,
//   updateStoreLogo,
//   updateCoverImage,
//   getAllVendors,
//   getVendorProfile,
// };
