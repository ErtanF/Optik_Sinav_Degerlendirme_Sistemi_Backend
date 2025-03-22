import { Router } from "express";
import {addSchool} from "../controllers/school.controller.js";
import { authenticateUser, isSuperAdmin } from "../middlewares/auth.middleware.js";

const schoolRouter = Router();

schoolRouter.post("/addschool",authenticateUser,isSuperAdmin, addSchool );

export default schoolRouter;