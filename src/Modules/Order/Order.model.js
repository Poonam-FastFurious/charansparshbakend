// import mongoose from "mongoose";

// // Define the schema for an order
// const orderSchema = new mongoose.Schema(
//   {
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     orderID: {
//       type: String,
//       required: true,
//       unique: true,
//       default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//     },
//     IsApproved:{
//       type:Number,
//       required:true,
//     },
//     product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//         required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//       totalAmount: {
//         type: Number,
//         required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending",
//     },
//     shippingInfo: {
//       address: {
//         type: String,
//         required: true,
//       },
//       city: {
//         type: String,
//         required: true,
//       },
//       state: {
//         type: String,
//         required: true,
//       },
//       postalCode: {
//         type: String,
//         required: true,
//       },
//       country: {
//         type: String,
//         required: true,
//       },
//       phoneNumber: {
//         type: String,
//         required: true,
//       },
//     },
//     paymentInfo: {
//       method: {
//         type: String,
//         enum: ["Credit Card", "PayPal", "Bank Transfer", "COD"],
//         required: true,
//       },
//       status: {
//         type: String,
//         enum: ["Pending", "Completed", "Failed"],
//         default: "Pending",
//       },
//     },
//     orderHistory: [
//       {
//         status: {
//           type: String,
//           enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//           default: "Pending",
//         },
//         changedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt fields
//   }
// );

// // Middleware to update the order history
// orderSchema.pre("save", function (next) {
//   if (this.isModified("status")) {
//     this.orderHistory.push({ status: this.status });
//   }
//   next();
// });

// // Middleware to set the updatedAt field to the current date before saving
// orderSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// export const Order = mongoose.model("Order", orderSchema);
