import mongoose from "mongoose";


const subcategorySchema = new mongoose.Schema(
      {
            subCategoryTitle: {
                  type: String,
                  required: true,
            },
            link: {
                  type: String,
                  required: true,
            },
            image: {
                  type: String,
            },
            status: {
                  type: String,
                  enum: ["active", "inactive"],
                  default: "active",
            },
            category: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Category",
                  required: true,
            },
      },
      {
            timestamps: true,
      }
);

// Export the subcategory model
export const SubCategory = mongoose.model("SubCategory", subcategorySchema);
