import School from "../models/school.js";
import mongoose from "mongoose";

/**
 * Süperadmin tarafından okul ekleme (admin olmadan)
 */
export const addSchool = async (req, res, next) => {
    try {
        const { name, city, address } = req.body;

        // Aynı isimde okul olup olmadığını kontrol et
        const existingSchool = await School.findOne({ name });
        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "School already exists"
            });
        }

        // Okulu oluştur, ancak admin olmadan
        const newSchool = await School.create({
            name,
            city,
            address,
            admin: null, // Henüz admin atanmamış
            teachers: [],
            classes: [],    // Sınıflar için boş dizi
            students: []    // Öğrenciler için boş dizi
        });

        res.status(201).json({
            success: true,
            message: "School added successfully, please assign an admin later.",
            data: newSchool
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Tüm okulları listele
 */
export const getAllSchools = async (req, res, next) => {
    try {
        // Okulları alfabetik sırala ve admin bilgilerini getir
        const schools = await School.find({})
            .populate("admin", "name email") // Admin bilgilerini getir
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: schools
        });
    } catch (error) {
        next(error);
    }
};
export const getSchoolById = async (req, res, next) => {
    try {
        const schoolId = req.params.id;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz okul ID formatı"
            });
        }

        // Okulu bul
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        res.status(200).json({
            success: true,
            data: school
        });
    } catch (error) {
        next(error);
    }
};

export const updateSchool = async (req, res, next) => {
    try {
        const schoolId = req.params.id;
        const { name, city, address } = req.body;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz okul ID formatı"
            });
        }

        // Okulu bul
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Okul bilgilerini güncelle
        school.name = name || school.name;
        school.city = city || school.city;
        school.address = address || school.address;

        await school.save();

        res.status(200).json({
            success: true,
            message: "Okul bilgileri güncellendi",
            data: school
        });

    } catch (error) {
        next(error);
    }
}

export const deleteSchool = async (req, res, next) => {
    try {
        const schoolId = req.params.id;

        // MongoDB ObjectId formatını kontrol et
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz okul ID formatı"
            });
        }

        // Okulu bul
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Okulu sil
        await school.deleteOne()

        res.status(200).json({
            success: true,
            message: "Okul silindi"
        });

    } catch (error) {
        next(error);
    }
}

