import express from "express";
import {addAdmin, approveTeacher , getApproveTeacher} from "../controllers/user.controller.js";
import { authenticateUser, isSuperAdmin, isSchoolAdmin } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/addadmin",authenticateUser,isSuperAdmin, addAdmin );
userRouter.post("/approveTeacher", authenticateUser, isSchoolAdmin, approveTeacher);
userRouter.get("/getApproveTeacher",authenticateUser , isSchoolAdmin, getApproveTeacher);


export default userRouter;
