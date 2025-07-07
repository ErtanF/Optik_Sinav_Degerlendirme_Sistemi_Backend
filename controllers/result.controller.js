import mongoose from "mongoose";
import OpticalTemplate from "../models/opticaltemplate.js";
import Exam from "../models/exam.js";
import path from "path";
import fs from "fs";

export const CalculateResult = async (req, res, next) => {
    try {
        const { examId, studentId } = req.body;

        // Exam ve OpticalTemplate modellerini kullanarak sonucu hesapla
        const exam = await Exam.findById(examId).populate('opticalTemplate');
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        const opticalTemplate = await OpticalTemplate.findById(exam.opticalTemplate._id);
        if (!opticalTemplate) {
            return res.status(404).json({
                success: false,
                message: "Optical Template not found"
            });
        }

        // Sonuç hesaplama işlemleri burada yapılacak
        // Örnek olarak, her bir optik şablon bileşenini kontrol edebiliriz
        let score = 0;
        opticalTemplate.components.forEach(component => {
            if (component.isCorrect) {
                score += component.points;
            }
        });

        // Sonucu kaydetme işlemi
        exam.results.push({ studentId, score });
        await exam.save();

        res.status(200).json({
            success: true,
            message: "Result calculated successfully",
            data: { examId, studentId, score }
        });

    } catch (error) {
        console.error("Error calculating result:", error);
        next(error);
    }
}

export const getResultById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid result ID format"
            });
        }

        // Sonucu bul
        const result = await Exam.findById(id).populate('results.studentId', 'name email');
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Error fetching result:", error);
        next(error);
    }
};

export const deleteResult = async (req, res, next) => {
    try {
        const { id } = req.params;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid result ID format"
            });
        }

        // Sonucu bul ve sil
        const result = await Exam.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Result deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting result:", error);
        next(error);
    }
};

export const getAllResults = async (req, res, next) => {
    try {
        const results = await Exam.find().populate('results.studentId', 'name email');

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Error fetching all results:", error);
        next(error);
    }
};