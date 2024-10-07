import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  getTotalPayments,
  placeOrder,
  updateOrderStatus,
} from "./Neworder.controler.js";

const router = Router();

router.route("/add").post(placeOrder);
router.route("/allorder").get(getAllOrders);
router.route("/singleorder/:id").get(getOrderById);
router.route("/updateorder").patch(updateOrderStatus);
router.route("/total-payments").get(getTotalPayments);

export default router;
