import express from 'express';
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
    addClass,
    getClassById,
    getAllClasses,
    getClassesBySchool,
    updateClass,
    deleteClass,
} from "../controllers/class.controller.js";

const classRouter = express.Router();

// Spesifik route'lar önce gelmeli
classRouter.get("/school/:schoolId", authenticateUser, getClassesBySchool);
// Temel CRUD işlemleri
classRouter.post("/", authenticateUser, addClass);
classRouter.get("/", authenticateUser, getAllClasses);
classRouter.get("/:id", authenticateUser, getClassById);
classRouter.put("/:id", authenticateUser, updateClass);
classRouter.delete("/:id", authenticateUser, deleteClass);

export default classRouter;