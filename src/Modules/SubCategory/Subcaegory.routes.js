import { Router } from "express";

import { upload } from "../../middlewares/FileUpload.middlwares.js";
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  updateSubCategory,
} from "./Subcategory.controler.js";

const router = Router();
router.route("/add").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createSubCategory
);
router.route("/allcategory").get(getAllSubCategories);
router.route("/update").patch(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  updateSubCategory
);
router.route("/delete").delete(deleteSubCategory);

export default router;
