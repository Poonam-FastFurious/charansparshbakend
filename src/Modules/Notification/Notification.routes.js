import { Router } from "express";
import {
    CreateNotification,
    UpdateNotification,
    deleteNotification,
    getAllNotification,
    getNotification
} from "./Notification.controler.js";

const router = Router();

router.route("/create").post(CreateNotification);
router.route("/update").patch(UpdateNotification);
router.route("/delete").delete(deleteNotification);
router.route("/allnotification").get(getAllNotification);
router.route("/notification").get(getNotification);
export default router;
