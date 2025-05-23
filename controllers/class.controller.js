import mongoose from "mongoose";
import Class from "../models/Class.js";
import School from "../models/school.js";
import Student from "../models/Student.js";

export const addClass = async (req, res, next) => {
    try {
        const { name, grade } = req.body;
        const school = req.user.schoolId;
        const schoolExists = await School.findById(school);
        if (!schoolExists) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Aynı isimde sınıf var mı kontrol et (aynı okul içinde)
        const existingClass = await Class.findOne({ name, school });
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "Bu okulda bu isimle bir sınıf zaten mevcut"
            });
        }

        const newClass = await Class.create({
            name,
            grade,
            school,
            students: []
        });

        // Okula sınıfı ekle
        schoolExists.classes.push(newClass._id);
        await schoolExists.save();

        res.status(201).json({
            success: true,
            message: "Sınıf başarıyla eklendi",
            data: newClass
        });

    } catch (error) {
        next(error);
    }
};


export const getClassById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const classData = await Class.findById(id)
            .populate("school", "name city")
            .populate("students", "firstName lastName studentNumber");

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        res.status(200).json({
            success: true,
            data: classData
        });

    } catch (error) {
        next(error);
    }
};

export const getAllClasses = async (req, res, next) => {
    try {
        const classes = await Class.find()
            .populate("school", "name city")
            .sort({ grade: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });

    } catch (error) {
        next(error);
    }
};

export const getClassesBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;

        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Okula ait sınıfları bul
        const classes = await Class.find({ school: schoolId })
            .sort({ grade: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });

    } catch (error) {
        next(error);
    }
};


export const updateClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, grade } = req.body;

        const classExists = await Class.findById(id);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        // Aynı isimde başka sınıf var mı kontrol et (aynı okul içinde)
        if (name && name !== classExists.name) {
            const duplicateClass = await Class.findOne({
                name,
                school: classExists.school,
                _id: { $ne: id }
            });

            if (duplicateClass) {
                return res.status(400).json({
                    success: false,
                    message: "Bu okulda bu isimle bir sınıf zaten mevcut"
                });
            }
        }

        // Sınıfı güncelle
        const updatedClass = await Class.findByIdAndUpdate(
            id,
            { name, grade },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Sınıf başarıyla güncellendi",
            data: updatedClass
        });

    } catch (error) {
        next(error);
    }
};


export const deleteClass = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const classData = await Class.findById(id).session(session);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        // İlişkili okuldan sınıfı kaldır
        const school = await School.findById(classData.school).session(session);
        if (school) {
            school.classes = school.classes.filter(
                classId => classId.toString() !== id
            );
            await school.save({ session });
        }

        // İlişkili öğrencilerin sınıf bilgisini güncelle
        if (classData.students.length > 0) {
            await Student.updateMany(
                { _id: { $in: classData.students } },
                { $unset: { class: 1 } },
                { session }
            );
        }

        // Sınıfı sil
        await Class.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Sınıf başarıyla silindi"
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
