import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
    addExam,
    deleteExam,
    updateExam,
    getExamById,
    getExamsByCreator,
    getExamsBySchool,
    getTemplatesBySchool,
    getTemplatesByCreator,
    getExamsByClass
} from "../controllers/exam.controller.js";

const examRouter = express.Router();

// Spesifik route'lar daha önce gelmeli
// Şablon (templates) routes
examRouter.get("/templates", authenticateUser, getTemplatesByCreator);
examRouter.get("/templates/school/:schoolId", authenticateUser, getTemplatesBySchool);

// Sınıf ve okula göre sınavlar
examRouter.get("/school/:schoolId", authenticateUser, getExamsBySchool);
examRouter.get("/class/:classId", authenticateUser, getExamsByClass);

// CRUD işlemleri
examRouter.post("/", authenticateUser, addExam);
examRouter.get("/", authenticateUser, getExamsByCreator);
examRouter.get("/:id", authenticateUser, getExamById);
examRouter.put("/:id", authenticateUser, updateExam);
examRouter.delete("/:id", authenticateUser, deleteExam);

export default examRouter;