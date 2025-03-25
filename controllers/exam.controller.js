import mongoose from "mongoose";
import Exam from "../models/exam.js";
import fs from "fs";

// 📌 1. Yeni sınav oluştur
export const addExam = async (req, res, next) => {
    try {
        const { title, school, createdBy, date, opticalFormImage, components } = req.body;

        // Aynı başlığa sahip sınav var mı kontrol et
        const existingExam = await Exam.findOne({ title, school });
        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: "An exam with this title already exists at this school."
            });
        }

        // Base64 gelen resmi dosyaya çevir ve kaydet
        const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `uploads/optical_${Date.now()}.png`;

        fs.writeFileSync(filename, buffer);

        const newExam = await Exam.create({
            title,
            school,
            createdBy : new mongoose.Types.ObjectId(createdBy),
            date,
            opticalFormImage: `/${filename}`,
            components
        });

        res.status(201).json({
            success: true,
            message: "Exam added successfully.",
            data: newExam
        });

    } catch (error) {
        next(error);
    }
};

// 📌 2. Tüm sınavları getir
export const getExamsByCreator = async (req, res, next) => {
    try {
        const { creatorId } = req.params;

        // Verilen kullanıcı tarafından oluşturulan sınavları getir
        const exams = await Exam.find({ createdBy: creatorId }).populate("school").populate("createdBy");

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });

    } catch (error) {
        next(error);
    }
};

// 📌 3. Belirli bir sınavı getir
export const getExamById = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id).populate("school").populate("createdBy");

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
        next(error);
    }
};

// 📌 4. Sınavı güncelle
export const updateExam = async (req, res, next) => {
    try {
        const { title, date, opticalFormImage, components } = req.body;

        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Eğer yeni bir optik form görseli geldiyse, eski dosyayı sil ve yenisini kaydet
        if (opticalFormImage && opticalFormImage !== exam.opticalFormImage) {
            fs.unlinkSync("." + exam.opticalFormImage); // Eski resmi sil

            const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const filename = `uploads/optical_${Date.now()}.png`;

            fs.writeFileSync(filename, buffer);
            exam.opticalFormImage = `/${filename}`;
        }

        // Güncellenen verileri ata
        exam.title = title || exam.title;
        exam.date = date || exam.date;
        exam.components = components || exam.components;

        await exam.save();

        res.status(200).json({
            success: true,
            message: "Exam updated successfully.",
            data: exam
        });

    } catch (error) {
        next(error);
    }
};

// 📌 5. Sınavı sil
export const deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Optik form görselini sil
        fs.unlinkSync("." + exam.opticalFormImage);

        await exam.deleteOne();

        res.status(200).json({
            success: true,
            message: "Exam deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};
