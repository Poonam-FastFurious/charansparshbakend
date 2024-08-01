
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Addon } from "./addons.modal.js";

// Controller function to create a new addon
export const createAddon = asyncHandler(async (req, res) => {
      if (!req.body) {
            throw new ApiError(400, "Request body is missing or empty");
      }

      const { name, price, status } = req.body;

      if (![name, price].every((field) => field?.trim())) {
            throw new ApiError(400, "Name and price are required");
      }

      const existingAddon = await Addon.findOne({ name });
      if (existingAddon) {
            throw new ApiError(409, "Addon with the same name already exists");
      }

      const addon = new Addon({
            name,
            price,
            status
      });
      await addon.save();

      return res.status(201).json(new ApiResponse(200, addon, "Addon created successfully"));
});


export const updateAddon = asyncHandler(async (req, res) => {
      const { id, name, price, status } = req.body;

      try {
            const addon = await Addon.findByIdAndUpdate(
                  id,
                  { name, price, status },
                  { new: true, runValidators: true } // Added runValidators to ensure validation is applied
            );

            if (!addon) {
                  return res.status(404).json(new ApiResponse(404, null, "Addon not found"));
            }

            return res.status(200).json(new ApiResponse(200, addon, "Addon updated successfully"));
      } catch (error) {
            console.error("Failed to update addon:", error);
            return res.status(500).json(new ApiResponse(500, null, "Failed to update addon"));
      }
});


// Controller function to delete an existing addon
export const deleteAddon = asyncHandler(async (req, res) => {
      const { id } = req.body;

      const addon = await Addon.findByIdAndDelete(id);

      if (!addon) {
            throw new ApiError(404, "Addon not found");
      }

      return res.json(new ApiResponse(200, {}, "Addon deleted successfully"));
});

// Controller function to get all addons
export const getAllAddon = asyncHandler(async (req, res) => {
      const addons = await Addon.find();
      return res.json(new ApiResponse(200, addons, "All addons retrieved successfully"));
});