import { Router } from "express";
import {addSchool, getAllSchools,getSchoolById , updateSchool , deleteSchool} from "../controllers/school.controller.js";
import { authenticateUser, isSuperAdmin } from "../middlewares/auth.middleware.js";

const schoolRouter = Router();

schoolRouter.post("/addschool",authenticateUser,isSuperAdmin, addSchool );
schoolRouter.get("/list", getAllSchools);
schoolRouter.get("/:id", authenticateUser,getSchoolById);
schoolRouter.put("/:id", authenticateUser, updateSchool);
schoolRouter.delete("/:id", authenticateUser, deleteSchool);

export default schoolRouter;