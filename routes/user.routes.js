import express from "express";
import {addAdmin, approveTeacher , getApproveTeacher, changePassword , updateProfile , getProfile,getApprovedTeachersBySchool} from "../controllers/user.controller.js";
import { authenticateUser, isSuperAdmin, isSchoolAdmin } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/addadmin",authenticateUser,isSuperAdmin, addAdmin );
userRouter.post("/approveTeacher", authenticateUser, isSchoolAdmin, approveTeacher);
userRouter.get("/getApproveTeacher",authenticateUser , isSchoolAdmin, getApproveTeacher);
userRouter.get("/getApprovedTeachersBySchool", authenticateUser, isSchoolAdmin, getApprovedTeachersBySchool);
userRouter.get("/getAllApprovedTeachers", authenticateUser, isSuperAdmin, getApprovedTeachersBySchool);

userRouter.get("/", authenticateUser, getProfile);
userRouter.put("/profile", authenticateUser, updateProfile);
userRouter.put("/change-password", authenticateUser, changePassword);



export default userRouter;
