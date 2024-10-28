import { Router } from "express";
import { addReturnPolicy, getReturnPolicy, updateReturnPolicy } from "./ReturmPolicy.controler.js";


const router = Router();

router.route("/add").post(addReturnPolicy);
router.route("/").get(getReturnPolicy);
router.route("/update").patch(updateReturnPolicy);


export default router;