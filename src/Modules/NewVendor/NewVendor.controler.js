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

const generateAccessAndRefreshTokens = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    const accessToken = vendor.generateAccessToken();
    const refreshToken = vendor.generateRefreshToken();

    vendor.refreshToken = refreshToken;
    vendor.loginTime = new Date();
    await vendor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const loginVendor = asyncHandler(async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    if (!email && !mobileNumber) {
      throw new ApiError(400, "Email or mobile number is required");
    }

    // Find the vendor by email or mobile number
    const vendor = await Vendor.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor does not exist");
    }

    // Validate password
    const isPasswordValid = await vendor.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      vendor._id
    );

    // Fetch logged-in vendor data (excluding password and refreshToken)
    const loggedInVendor = await Vendor.findById(vendor._id).select(
      "-password -refreshToken"
    );

    vendor.loginStatus = true;
    await vendor.save({ validateBeforeSave: false });

    // Set options for cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    };

    // Send response with cookies and logged-in vendor data
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(true, "Vendor logged in successfully", {
          vendor: loggedInVendor,
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    console.error("Error during login:", error);

    // Handle specific errors
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(false, error.message));
    }

    // Handle other unexpected errors
    return res
      .status(500)
      .json(new ApiResponse(false, "Internal server error"));
  }
});

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vendors",
      error: error.message,
    });
  }
};
const logoutVendor = asyncHandler(async (req, res) => {
  try {
    // Clear the cookies for access and refresh tokens
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      expires: new Date(0), // Set expiration date to the past to clear the cookie
    };

    res.cookie("accessToken", "", options).cookie("refreshToken", "", options);

    // Optionally, update the vendor's login status if needed
    if (req.user) {
      // Assuming `req.user` contains the authenticated vendor data
      const vendor = await Vendor.findById(req.user._id);
      if (vendor) {
        vendor.loginStatus = false;
        await vendor.save({ validateBeforeSave: false });
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "Vendor logged out successfully"));
  } catch (error) {
    console.error("Error during logout:", error);

    // Handle unexpected errors
    return res
      .status(500)
      .json(new ApiResponse(false, "Internal server error"));
  }
});
const getVendorDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.query;

    // Validate ID
    if (!id) {
      throw new ApiError(400, "Vendor ID is required");
    }

    // Find vendor by ID
    const vendor = await Vendor.findById(id);

    // Check if vendor exists
    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    // Return successful response
    return res
      .status(200)
      .json(
        new ApiResponse(true, "Vendor details retrieved successfully", vendor)
      );
  } catch (error) {
    console.error("Error during retrieving vendor details:", error);

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
export {
  registerVendor,
  loginVendor,
  getAllVendors,
  logoutVendor,
  getVendorDetails,
};
