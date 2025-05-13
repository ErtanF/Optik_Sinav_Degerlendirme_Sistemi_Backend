import express from 'express';
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
    addStudent,
    addStudentsFromList,
    deleteStudent,
    updateStudent,
    getStudentByCreator,
    getStudentById,
    getStudentsBySchool,
    getStudentsByClass
} from "../controllers/student.controller.js";

const studentRouter = express.Router();

// Spesifik route'lar önce gelmeli
studentRouter.post("/list", authenticateUser, addStudentsFromList);
studentRouter.get("/school/:schoolId", authenticateUser, getStudentsBySchool);
studentRouter.get("/class/:classId", authenticateUser, getStudentsByClass);

// Temel CRUD işlemleri
studentRouter.post("/", authenticateUser, addStudent);
studentRouter.get("/", authenticateUser, getStudentByCreator);
studentRouter.get("/:id", authenticateUser, getStudentById);
studentRouter.put("/:id", authenticateUser, updateStudent);
studentRouter.delete("/:id", authenticateUser, deleteStudent);

export default studentRouter;