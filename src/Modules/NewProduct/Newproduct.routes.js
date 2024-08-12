import { Router } from "express";

import { upload } from "../../middlewares/FileUpload.middlwares.js";
import { addProduct } from "./NewProduct.controler.js";

const router = Router();

router.route("/add").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 10,
    },
  ]),
  addProduct
);

export default router;
