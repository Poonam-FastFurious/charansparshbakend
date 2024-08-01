import { Router } from "express";
import { addFAQ } from "./Faqs.controler.js";





const router = Router();

router.route("/add").post(addFAQ);


export default router;