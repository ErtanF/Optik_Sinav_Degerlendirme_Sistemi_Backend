import mongoose from "mongoose";
import OpticalTemplate from "../models/OpticalTemplate.js";
import path from "path";
import fs from "fs";


export const addOpticalTemplate = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name, opticalFormImage, components, isPublic = false } = req.body;

        // Görseli base64 olarak kaydet
        let savedImagePath = null;
        if (opticalFormImage && opticalFormImage.startsWith("data:image/")) {
            const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const uploadDir = path.resolve("uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filename = `optical_template_${Date.now()}.png`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            savedImagePath = `/uploads/${filename}`;
        }

        const newTemplate = new OpticalTemplate({
            name,
            components,
            createdBy: userId,
            opticalFormImage: savedImagePath,
            isPublic
        });

        await newTemplate.save();

        return res.status(201).json({
            success: true,
            message: "Optical template created successfully.",
            data: newTemplate
        });

    } catch (error) {
        console.error("Optical template creation error:", error);
        next(error);
    }
};

export const getOpticalTemplatesByCreator = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Kullanıcının oluşturduğu optik şablonları getir
        const templates = await OpticalTemplate.find({ createdBy: userId }).populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            data: templates
        });

    } catch (error) {
        console.error("Error fetching optical templates:", error);
        next(error);
    }
};

export const getPublicOpticalTemplates = async (req, res, next) => {
    try {
        // Tüm kamuya açık optik şablonları getir
        const templates = await OpticalTemplate.find({ isPublic: true }).populate("createdBy", "name email");

        return res.status(200).json({
            success: true,
            data: templates
        });

    } catch (error) {
        console.error("Error fetching public optical templates:", error);
        next(error);
    }
};

export const getOpticalTemplateById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid optical template ID format"
            });
        }

        // Optik şablonu bul
        const template = await OpticalTemplate.findById(id).populate("createdBy", "name email");
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Optical template not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: template
        });

    } catch (error) {
        console.error("Error fetching optical template:", error);
        next(error);
    }
};

export const updateOpticalTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, opticalFormImage, components, isPublic } = req.body;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid optical template ID format"
            });
        }

        // Optik şablonu bul
        const template = await OpticalTemplate.findById(id);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Optical template not found"
            });
        }

        // Görseli base64 olarak kaydet
        let savedImagePath = template.opticalFormImage;
        if (opticalFormImage && opticalFormImage.startsWith("data:image/")) {
            const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const uploadDir = path.resolve("uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filename = `optical_template_${Date.now()}.png`;
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            savedImagePath = `/uploads/${filename}`;
        }

        // Şablonu güncelle
        template.name = name || template.name;
        template.components = components || template.components;
        template.opticalFormImage = savedImagePath;
        template.isPublic = isPublic !== undefined ? isPublic : template.isPublic;

        await template.save();

        return res.status(200).json({
            success: true,
            message: "Optical template updated successfully.",
            data: template
        });

    } catch (error) {
        console.error("Error updating optical template:", error);
        next(error);
    }
};

export const deleteOpticalTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid optical template ID format"
            });
        }

        // Optik şablonu bul ve sil
        const template = await OpticalTemplate.findByIdAndDelete(id);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Optical template not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Optical template deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting optical template:", error);
        next(error);
    }
};

export const getOpticalTemplateComponents = async (req, res, next) => {
    try {
        const { id } = req.params;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid optical template ID format"
            });
        }

        // Optik şablonu bul
        const template = await OpticalTemplate.findById(id);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Optical template not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: template.components
        });

    } catch (error) {
        console.error("Error fetching optical template components:", error);
        next(error);
    }
};

