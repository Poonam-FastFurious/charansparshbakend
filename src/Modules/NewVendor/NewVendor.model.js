import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { Schema } = mongoose;
const VendorSchema = new Schema(
  {
    sellerLegalName: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
    },
    panNumber: {
      type: String,
      required: true,
    },
    panCardPhoto: {
      type: String,
    },
    gstCertificate: {
      type: String,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    confirmAccountNumber: {
      type: String,

      validate: {
        validator: function (value) {
          return value === this.accountNumber;
        },
        message: "Account numbers do not match",
      },
    },
    ifscCode: {
      type: String,
      required: true,
    },
    vendorType: {
      type: String,
      enum: ["Vendor", "Temple", "Pandit", "Tourist Guide"],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,

      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match",
      },
    },
    storeLogo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    businessName: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
    },
    storeCategory: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

VendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

VendorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

VendorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      mobileNumber: this.mobileNumber,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

VendorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Vendor = mongoose.model("Vendor", VendorSchema);
