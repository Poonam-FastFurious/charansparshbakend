import { Router } from "express";
import {
    getAllEmployeeRole
} from "./EmployeeRole.controler.js";

const router = Router();
router.route("/allEmployeeRoles").get(getAllEmployeeRole);
export default router;
