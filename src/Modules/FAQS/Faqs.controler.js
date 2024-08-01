import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { FAQ } from "./Faqs.modal.js" // Assuming your FAQ model file is named FAQ.modal.js

// Controller function to add a new FAQ
const addFAQ = asyncHandler(async (req, res) => {
      try {
            // Get FAQ details from the request body
            const { faq } = req.body;

            // Validation - Check if required fields are not empty
            if (!faq) {
                  throw new ApiError(400, "FAQ is required");
            }

            // Check if FAQ already exists
            const existingFAQ = await FAQ.findOne({ faq });

            if (existingFAQ) {
                  throw new ApiError(409, "FAQ already exists");
            }

            // Create the FAQ object
            const newFAQ = await FAQ.create({ faq });

            // Check for FAQ creation
            if (!newFAQ) {
                  throw new ApiError(500, "Something went wrong while creating the FAQ");
            }

            return res.status(201).json({
                  success: true,
                  data: newFAQ,
                  message: "FAQ created successfully",
            });
      } catch (error) {
            // Handle errors
            if (error instanceof ApiError) {
                  return res.status(error.statusCode).json({ success: false, error: error.message });
            } else {
                  return res.status(500).json({ success: false, error: "Internal server error" });
            }
      }
});

export { addFAQ };
