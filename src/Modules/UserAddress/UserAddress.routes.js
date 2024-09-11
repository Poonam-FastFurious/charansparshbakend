import { Router } from "express";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "./UserAddress.controler.js";
import { verifyJWT } from "../../middlewares/auth.middlwares.js";
const router = Router();
router.route("/add").post(verifyJWT, createAddress);
router.route("/").get(verifyJWT, getAddresses);
router.route("/update").patch(verifyJWT, updateAddress);
router.route("/delete").delete(verifyJWT, deleteAddress);

export default router;
