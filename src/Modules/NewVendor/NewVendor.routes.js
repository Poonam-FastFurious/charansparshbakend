import { Router } from "express";

import { upload } from "../../middlewares/FileUpload.middlwares.js";
import {
  addDeliveredProductTransaction,
  getAllVendors,
  getAllWithdrawalRequests,
  getVendorDetails,
  loginVendor,
  logoutVendor,
  registerVendor,
  requestWithdrawal,
  updateWithdrawalStatus,
} from "./NewVendor.controler.js";
import { vendorVerifyJWT } from "../../middlewares/vendorVerifyJWT.js";

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
router.route("/login").post(loginVendor);
router.route("/addpayments").post(addDeliveredProductTransaction);
router.route("/").get(getAllVendors);
router.route("/logout").post(logoutVendor);
router.route("/withdrawl").post(vendorVerifyJWT, requestWithdrawal);
router.route("/aprovewithdrwal").post(updateWithdrawalStatus);
router.route("/withdrawlall").get(getAllWithdrawalRequests);
router.route("/vendor").get(getVendorDetails);

export default router;
