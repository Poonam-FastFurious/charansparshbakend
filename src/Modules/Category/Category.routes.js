import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./Category.controler.js";
import { upload } from "../../middlewares/FileUpload.middlwares.js";

const router = Router();
router.route("/add").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createCategory
);
router.route("/delete").delete(deleteCategory);

router.get("/details/:id", getCategoryById);

router.route("/allcategory").get(getAllCategories);
router.route("/update").patch(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  updateCategory
);
export default router;
