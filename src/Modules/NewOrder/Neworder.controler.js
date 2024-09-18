import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addDeliveredProductTransaction } from "../NewVendor/NewVendor.controler.js";
import { Product } from "../Product/Product.models.js";
import { User } from "../User/User.model.js";
import { Order } from "./NewOrder.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { customerId, products, shippingInfo, paymentInfo } = req.body;

  if (!customerId || !products || !shippingInfo || !paymentInfo) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const customer = await User.findById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    // Group products by vendor
    const vendorProducts = {};
    for (const product of products) {
      if (!product.productId || !product.quantity) {
        throw new ApiError(
          400,
          "Product ID and quantity are required for each product."
        );
      }

      const productDetails = await Product.findById(product.productId);
      if (!productDetails) {
        throw new ApiError(
          404,
          `Product with ID ${product.productId} not found`
        );
      }

      if (product.quantity > productDetails.stocks) {
        throw new ApiError(
          400,
          `Insufficient stock for ${productDetails.title}`
        );
      }

      const vendorId = productDetails.vendor?.id; // Use productDetails.vendor.id
      if (!vendorId) {
        console.warn(`No vendor ID found for product ${product.productId}`);
        throw new ApiError(
          400,
          `Vendor not found for product ${product.productId}`
        );
      }

      if (!vendorProducts[vendorId]) {
        vendorProducts[vendorId] = [];
      }

      vendorProducts[vendorId].push({
        product: product.productId,
        quantity: product.quantity,
        price: productDetails.price,
      });
    }

    // Create separate orders for each vendor
    const orders = [];
    for (const vendorId in vendorProducts) {
      const vendorProductsArray = vendorProducts[vendorId];

      const totalAmount = vendorProductsArray.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );

      if (isNaN(totalAmount)) {
        throw new ApiError(400, "Invalid total amount calculation.");
      }

      const order = await Order.create({
        customer: customer._id,
        customerName: customer.fullName,
        vendor: vendorId, // Store vendor's ID
        products: vendorProductsArray,
        totalAmount,
        shippingInfo,
        paymentInfo,
        status: "Pending",
      });
      for (const item of vendorProductsArray) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stocks -= item.quantity;
          if (product.stocks < 0) {
            // Revert the order if stock is insufficient
            await Order.findByIdAndDelete(order._id);
            return res
              .status(400)
              .json({ error: `Not enough stock for product ${product._id}` });
          }
          await product.save();
        } else {
          // Revert the order if product is not found
          await Order.findByIdAndDelete(order._id);
          return res
            .status(404)
            .json({ error: `Product ${item.product} not found` });
        }
      }
      orders.push(order);
    }

    // Return a success response with all orders
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          orders,
          "Orders placed successfully for each vendor"
        )
      );
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong while placing the order",
    });
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // Fetch all orders
    const orders = await Order.find().populate({
      path: "customer", // Populate customer details
      select: ["fullName", "email", "mobile"], // Select customer fields
    });

    // Extract all unique product IDs
    const productIds = orders.flatMap((order) =>
      order.products.map((p) => p.product._id)
    );

    // Fetch all products based on the extracted product IDs and populate vendor details
    const products = await Product.find({ _id: { $in: productIds } })
      .populate({
        path: "vendor", // Populate vendor details
        select: "name _id", // Select vendor fields
      })
      .exec();

    // Create a map of product IDs to vendor details
    const productVendorMap = products.reduce((map, product) => {
      map[product._id] = product.vendor;
      return map;
    }, {});

    // Create a map of orders with vendor details attached outside the products array
    const ordersWithVendorDetails = orders.map((order) => {
      const vendors = order.products.reduce((acc, p) => {
        const vendor = productVendorMap[p.product._id];
        if (vendor) {
          acc[vendor._id] = vendor; // Add vendor to the map
        }
        return acc;
      }, {});

      return {
        ...order.toObject(),
        vendorDetails: Object.values(vendors), // Attach vendor details outside of products
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          ordersWithVendorDetails,
          "Orders retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new ApiError(500, "Something went wrong while fetching orders");
  }
});

const getOrderById = async (req, res) => {
  const { id } = req.params; // Extract the order ID from request parameters
  console.log("Received order ID:", id);
  try {
    // Find the order by ID
    const order = await Order.findById(id)
      .populate({ path: "customer", select: ["fullName", "email", "mobile"] }) // Populate customer with fullName field only
      .populate({
        path: "products.product",
        select: [
          "productTitle",
          "image",
          "thumbnail",
          "oneTimePrice",
          "subscriptionPrice",
          "discountPercentage",
          "rating",

          "category",
        ],
      });
    console.log("Retrieved order:", order);
    // If order is not found, return an error response
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // If order is found, return success response with order details
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    // If any error occurs during retrieval, return an error response
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const orderId = req.body.orderID;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const { status, vendorId, amount } = req.body;

    if (!status) {
      throw new ApiError(400, "Status field is required");
    }

    // Check if the status is one of the allowed values
    const allowedStatusValues = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!allowedStatusValues.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    // Find the order by orderID and update its status
    const order = await Order.findOneAndUpdate(
      { orderID: orderId },
      { status },
      { new: true } // Return the updated document
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }
    if (status === "Delivered") {
      if (!vendorId || !amount) {
        throw new ApiError(
          400,
          "Vendor ID and amount are required for transaction"
        );
      }
      await addDeliveredProductTransaction({ body: { vendorId, amount } }, res);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order status updated successfully"));
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(
        500,
        "Something went wrong while updating order status"
      );
    }
  }
});
const getTotalPayments = async (req, res) => {
  try {
    // Aggregate the totalAmount from all orders
    const totalPayments = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // If no orders exist, return total as 0
    const totalAmount = totalPayments.length > 0 ? totalPayments[0].total : 0;

    res.status(200).json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error("Error calculating total payments:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export {
  placeOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getTotalPayments,
 
};
