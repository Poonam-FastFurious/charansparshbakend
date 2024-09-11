import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Product } from "../Product/Product.models.js";
import { User } from "../User/User.model.js";
import { Order } from "./NewOrder.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { customerId, products, totalAmount, shippingInfo, paymentInfo } =
    req.body;

  // Validate required fields
  if (
    !customerId ||
    !products ||
    !totalAmount ||
    !shippingInfo ||
    !paymentInfo
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    // Create the order
    const customer = await User.findById(customerId);

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
    const order = await Order.create({
      customer: customer._id, // Saving customer ID in the order
      customerName: customer.name,
      products,
      totalAmount,
      shippingInfo,
      paymentInfo,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order placed successfully"));
  } catch (error) {
    console.error("Error placing order:", error);
    throw new ApiError(500, "Something went wrong while placing the order");
  }
});
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // Fetch all orders
    const orders = await Order.find();

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

    const { status } = req.body;

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

export { placeOrder, getAllOrders, updateOrderStatus, getOrderById };
