import { Router } from "express";

import {
  addtermscondition,
  getAllTermsConditions,
} from "./termscondition.controler.js";

const router = Router();
router.route("/add").post(addtermscondition);
router.route("/").get(getAllTermsConditions);

export default router;
