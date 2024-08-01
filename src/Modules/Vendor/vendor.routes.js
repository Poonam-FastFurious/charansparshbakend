// import { Router } from "express";
// import {
//   registerVendor,
//   getCurrentVendor,
//   updateStoreLogo,
//   updateCoverImage,
//   updateVendorDetails,
//   getAllVendors,
//   getVendorProfile,
// } from "./Vendor.controler.js";

// import { verifyJWT } from "../../middlewares/auth.middlwares.js";
// import { upload } from "../../middlewares/FileUpload.middlwares.js";

// const router = Router();

// router.route("/register").post(
//   upload.fields([
//     {
//       name: "avatar",
//       maxCount: 1,
//     },
//   ]),
//   registerVendor
// );

// //secured routes
// //router.route("/logout").post(verifyJWT, logoutVendor);
// //router.route("/refresh-token").post(refreshAccessToken);
// //router.route("/change-password").post(verifyJWT, changeCurrentPassword);
// router.route("/current-vendor").get(verifyJWT, getCurrentVendor);
// router.route("/allvendor").get(getAllVendors);
// router.route("/update-vendor").patch(verifyJWT, updateVendorDetails);
// router.route("/getvendor").get(getVendorProfile);

// router.route("/avatar").patch(upload.single("storeLogo"), updateStoreLogo);
// router.route("/cover").patch(upload.single("coverImage"), updateCoverImage);
// export default router;
