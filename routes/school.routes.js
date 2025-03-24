import { Router } from "express";
import {addSchool, getAllSchools} from "../controllers/school.controller.js";
import { authenticateUser, isSuperAdmin } from "../middlewares/auth.middleware.js";

const schoolRouter = Router();

schoolRouter.post("/addschool",authenticateUser,isSuperAdmin, addSchool );
schoolRouter.get("/list", getAllSchools);

export default schoolRouter;