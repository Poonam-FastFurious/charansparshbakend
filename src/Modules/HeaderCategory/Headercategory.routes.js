import { Router } from "express";
import {
  createHeaderCategory,
  deleteHeaderCategory,
  getAllHeaderCategories,
} from "./HeaderCategory.controler.js";
import { upload } from "../../middlewares/FileUpload.middlwares.js";

const router = Router();

router.route("/add").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "audio",
      maxCount: 1,
    },
  ]),
  createHeaderCategory
);
router.route("/").get(getAllHeaderCategories);
router.route("/delete").delete(deleteHeaderCategory);
export default router;
