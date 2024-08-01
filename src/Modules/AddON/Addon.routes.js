import { Router } from "express";
import { createAddon, deleteAddon, getAllAddon, updateAddon } from "./addon.controler.js";

const router = Router();


router.route("/alladdons").get(getAllAddon);
router.route("/add").post(createAddon);
router.route("/delete").delete(deleteAddon);
router.route("/update").patch(updateAddon);
export default router;