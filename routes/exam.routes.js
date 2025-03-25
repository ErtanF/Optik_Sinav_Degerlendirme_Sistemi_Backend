import express from "express";
import {authenticateUser} from "../middlewares/auth.middleware.js";
import { addExam, deleteExam, updateExam, getExamById, getExamsByCreator } from "../controllers/exam.controller.js";

const examRouter = express.Router();

examRouter.post("/addexam",authenticateUser,  addExam);
examRouter.get("/getExam/creator/:creatorId",authenticateUser,getExamsByCreator);
examRouter.put("/editExam/:id",authenticateUser,updateExam);
examRouter.delete("/deleteExam/:id",authenticateUser ,deleteExam);
examRouter.get("/getExams/:id",authenticateUser , getExamById);


export default examRouter;
