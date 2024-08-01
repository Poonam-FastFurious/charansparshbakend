// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// // Define a schema for the user
// const vendorSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//   },
//   storeName: {
//     type: String,
//   },
//   address: {
//     type: String,
//   },
//   storeLogo: {
//     type: String,
//   },
//   coverImage: {
//     type: String,
//   },
//   storeLegalName: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   GSTNumber: {
//     type: String,
//   },
//   PANNumber: {
//     type: String,
//     required: true,
//   },
//   registerAs: {
//     type: String,
//     enum: ["Vendor", "Pandit", "Temple", "TouristGuide"],
//   },
//   username: {
//     type: String,
//   },
//   mobileNumber: {
//     type: Number,
//     required: true,
//   },
//   GSTCertificate: {
//     type: Date,
//   },
//   PANCard: {
//     type: String,
//   },
// });

// export const Vendor = mongoose.model("Vendor", vendorSchema);
