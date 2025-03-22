import express from "express";
import {addAdmin, approveTeacher} from "../controllers/user.controller.js";
import { authenticateUser, isSuperAdmin, isSchoolAdmin } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/addadmin",authenticateUser,isSuperAdmin, addAdmin );
userRouter.post("/approveTeacher", authenticateUser, isSchoolAdmin, approveTeacher);


export default userRouter;
