import { Router } from "express";
import {
  createState,
  deleteState,
  getState,
  updateState,
} from "./State.controler.js";

const router = Router();
router.route("/add").post(createState);
router.route("/").get(getState);
router.route("/delete").delete(deleteState);
router.route("/update").patch(updateState);

export default router;
