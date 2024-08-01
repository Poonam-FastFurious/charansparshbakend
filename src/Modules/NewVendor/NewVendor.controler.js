import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import { Vendor } from "./NewVendor.model.js";

const registerVendor = asyncHandler(async (req, res) => {
  try {
    if (!req.body || !req.files) {
      throw new ApiError(400, "Request body or files are missing");
    }

    const {
      sellerLegalName,
      panNumber,
      accountHolderName,
      accountType,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      vendorType,
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      confirmPassword,
      businessName,
      storeCategory,
      pinCode,
      city,
      address,
    } = req.body;

    // Validate required fields
    if (
      ![
        sellerLegalName,
        panNumber,
        accountHolderName,
        accountType,
        accountNumber,
        confirmAccountNumber,
        ifscCode,
        vendorType,
        firstName,
        lastName,
        mobileNumber,
        email,
        password,
        confirmPassword,
        businessName,
        storeCategory,
        pinCode,
        city,
        address,
      ].every((field) => field && field.trim())
    ) {
      throw new ApiError(400, "All required fields must be filled");
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    // Check if account numbers match
    if (accountNumber !== confirmAccountNumber) {
      throw new ApiError(400, "Account numbers do not match");
    }

    // Handle file uploads for panCardPhoto and other documents
    const panCardPhotoPath = req.files?.panCardPhoto?.[0]?.path;
    const gstCertificatePath = req.files?.gstCertificate?.[0]?.path;
    const storeLogoPath = req.files?.storeLogo?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    const uploadedPanCardPhoto = panCardPhotoPath
      ? await uploadOnCloudinary(panCardPhotoPath)
      : null;
    const uploadedGstCertificate = gstCertificatePath
      ? await uploadOnCloudinary(gstCertificatePath)
      : null;
    const uploadedStoreLogo = storeLogoPath
      ? await uploadOnCloudinary(storeLogoPath)
      : null;
    const uploadedCoverImage = coverImagePath
      ? await uploadOnCloudinary(coverImagePath)
      : null;

    // Create a new vendor
    const newVendor = await Vendor.create({
      sellerLegalName,
      gstNumber: req.body.gstNumber,
      panNumber,
      panCardPhoto: uploadedPanCardPhoto?.url,
      gstCertificate: uploadedGstCertificate?.url,
      accountHolderName,
      accountType,
      accountNumber,
      ifscCode,
      vendorType,
      firstName,
      lastName,
      mobileNumber,
      email,
      password, // Ensure password is hashed before saving
      storeLogo: uploadedStoreLogo?.url,
      coverImage: uploadedCoverImage?.url,
      businessName,
      storeName: req.body.storeName,
      storeCategory,
      pinCode,
      city,
      address,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
    });

    // Return successful response
    return res
      .status(201)
      .json(new ApiResponse(true, "Vendor registered successfully", newVendor));
  } catch (error) {
    console.error("Error during vendor registration:", error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(false, error.message));
    }

    return res
      .status(500)
      .json(new ApiResponse(false, "Internal server error"));
  }
});

export { registerVendor };
