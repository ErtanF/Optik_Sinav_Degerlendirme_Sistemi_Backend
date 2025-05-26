import mongoose from "mongoose";
import Exam from "../models/exam.js";
import School from "../models/school.js";
import Class from "../models/Class.js";
import fs from "fs";
import path from "path";

/**
 * Sınav ekleme
 */
export const addExam = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const schoolId = req.user.schoolId;
        const {
            title,
            date,
            class: classId,
            assignedClasses = [],
            studentIds = [],
            isTemplate = false,
            opticalTemplateId
        } = req.body;

        // Okul kontrolü
        const schoolExists = await School.findById(schoolId);
        if (!schoolExists) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        // Sınıf kontrolü
        if (classId) {
            const classExists = await Class.findById(classId);
            if (!classExists) {
                return res.status(404).json({ success: false, message: "Class not found" });
            }
        }

        // Aynı başlık kontrolü
        const existingExam = await Exam.findOne({ title, school: schoolId });
        if (existingExam) {
            return res.status(400).json({ success: false, message: "Exam with this title already exists." });
        }

        const newExam = new Exam({
            title,
            date,
            school: schoolId,
            class: classId || null,
            assignedClasses,
            studentIds,
            isTemplate,
            opticalTemplate: opticalTemplateId,
            createdBy: userId
        });

        await newExam.save();

        return res.status(201).json({
            success: true,
            message: "Exam created successfully.",
            data: newExam
        });

    } catch (error) {
        console.error("Exam creation error:", error);
        next(error);
    }
};

/**
 * Kullanıcının oluşturduğu sınavları getir
 */
export const getExamsByCreator = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Kullanıcının oluşturduğu sınavları al
        const exams = await Exam.find({ createdBy: userId })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
            .populate("opticalTemplate", "name opticalFormImage") // yeni alan
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        console.error("Get exams by creator error:", error);
        next(error);
    }
};


/**
 * Belirli bir sınavı getir
 */
export const getExamById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findById(id)
            .populate("school", "name city address")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
            .populate("studentIds", "firstName lastName studentNumber bookletType")
            .populate("opticalTemplate", "name opticalFormImage components"); // 🔄 Yeni eklendi

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        res.status(200).json({
            success: true,
            data: exam
        });

    } catch (error) {
        console.error("Get exam by ID error:", error);
        next(error);
    }
};


/**
 * Sınavı güncelle
 */
export const updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const school = req.user.schoolId;

        const {
            title,
            date,
            class: classId,
            studentIds = [],
            isTemplate = false,
            assignedClasses = [],
            opticalTemplateId
        } = req.body;

        console.log("Gelen güncelleme isteği:", req.body);

        // Sınavı bul
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Okul kontrolü
        if (school && school !== exam.school.toString()) {
            const schoolExists = await School.findById(school);
            if (!schoolExists) {
                return res.status(404).json({
                    success: false,
                    message: "School not found"
                });
            }
        }

        // Sınıf kontrolü
        if (classId && classId !== exam.class?.toString()) {
            const classExists = await Class.findById(classId);
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: "Class not found"
                });
            }
        }

        // Güncellenebilir alanları hazırla
        const updateData = {
            title: title || exam.title,
            date: date || exam.date,
            class: classId || exam.class,
            studentIds: Array.isArray(studentIds) ? studentIds : exam.studentIds,
            isTemplate: isTemplate !== undefined ? isTemplate : exam.isTemplate,
            assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : exam.assignedClasses,
            opticalTemplate: opticalTemplateId || exam.opticalTemplate
        };

        // Güncelle
        const updatedExam = await Exam.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: "Exam updated successfully.",
            data: updatedExam
        });

    } catch (error) {
        console.error("Exam update error:", error);
        next(error);
    }
};

/**
 * Sınavı sil
 */
export const deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Sadece sınav kaydını sil
        await exam.deleteOne();

        res.status(200).json({
            success: true,
            message: "Exam deleted successfully."
        });

    } catch (error) {
        console.error("Exam deletion error:", error);
        next(error);
    }
};

/**
 * Okula göre sınavları getir
 */
export const getExamsBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;

        // Okul kontrolü
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        // Sınavları getir
        const exams = await Exam.find({ school: schoolId })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
            .populate("opticalTemplate", "name opticalFormImage components") // 👈 Yeni
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        console.error("Get exams by school error:", error);
        next(error);
    }
};
/**
 * Okula göre şablon sınavları getir
 */
export const getTemplatesBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;
        // Okul kontrolü
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        // Okul ID'sine göre şablon sınavları getir
        const exams = await Exam.find({ school: schoolId, isTemplate: true })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Sınıfa göre sınavları getir
 */
export const getExamsByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;

        // Sınıf var mı kontrol et
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // Bu sınıfa atanmış olan sınavları bul: direkt atanmış veya assignedClasses içinde olanlar
        const exams = await Exam.find({
            $or: [
                { class: classId },
                { assignedClasses: classId }
            ]
        })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
            .populate("opticalTemplate", "name opticalFormImage components")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        console.error("Get exams by class error:", error);
        next(error);
    }
};

/**
 * Kullanıcının oluşturduğu şablon sınavları getir
 */
export const getTemplatesByCreator = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Kullanıcı ID'sine göre şablon sınavları getir
        const exams = await Exam.find({ createdBy: userId, isTemplate: true })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        next(error);
    }
};