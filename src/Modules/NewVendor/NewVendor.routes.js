import { Router } from "express";

import { upload } from "../../middlewares/FileUpload.middlwares.js";
import { registerVendor } from "./NewVendor.controler.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "panCardPhoto",
      maxCount: 1,
    },
    {
      name: "gstCertificate",
      maxCount: 1,
    },
    {
      name: "storeLogo",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerVendor
);

export default router;
