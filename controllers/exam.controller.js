import mongoose from "mongoose";
import Exam from "../models/exam.js";
import School from "../models/school.js";
import Class from "../models/Class.js";
import fs from "fs";
import path from "path";


export const addExam = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const school = req.user.schoolId;
        const {
            title,
            date,
            class: classId,
             assignedClasses = [],
            studentIds = [],
            isTemplate = false,
            opticalFormImage,
            components
        } = req.body;

        // Okul kontrolü
        const schoolExists = await School.findById(school);
        if (!schoolExists) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Eğer sınıf belirtilmişse kontrolü yap
        if (classId) {
            const classExists = await Class.findById(classId);
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: "Sınıf bulunamadı"
                });
            }
        }

        // Aynı başlıklı sınav kontrolü
        const existingExam = await Exam.findOne({ title, school });
        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: "Bu okulda bu başlıkla bir sınav zaten mevcut."
            });
        }

        // Optik görsel varsa dosyaya kaydet
        let savedImagePath = null;
        if (opticalFormImage && opticalFormImage.startsWith("data:image/")) {
            try {
                const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, "base64");
                const uploadDir = path.resolve("uploads");

                // uploads dizinini oluştur (yoksa)
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filename = `optical_${Date.now()}.png`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, buffer);
                savedImagePath = `/uploads/${filename}`;
            } catch (error) {
                console.error("Resim kaydetme hatası:", error);
                return res.status(500).json({
                    success: false,
                    message: "Optik form görüntüsü kaydedilirken hata oluştu"
                });
            }
        }

        // Yeni sınav nesnesi oluştur
        const newExam = new Exam({
            title,
            school,
            createdBy: new mongoose.Types.ObjectId(userId),
            date,
            class: classId || null,
             assignedClasses: assignedClasses.length > 0 ? assignedClasses : [],
            studentIds: studentIds.length > 0 ? studentIds : [],
            isTemplate,
            opticalFormImage: savedImagePath,
            components
        });

        await newExam.save();

        return res.status(201).json({
            success: true,
            message: "Sınav başarıyla oluşturuldu",
            data: newExam
        });

    } catch (error) {
        console.error("Sınav oluşturma hatası:", error);
        next(error);
    }
};


export const getExamsByCreator = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Kullanıcı ID'sine göre sınavları getir
        const exams = await Exam.find({ createdBy: userId })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
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


export const getExamById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Sınavı ID'sine göre bul
        const exam = await Exam.findById(id)
            .populate("school", "name city address")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
            .populate("studentIds", "firstName lastName studentNumber bookletType");

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Sınav bulunamadı"
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
            opticalFormImage,
            components,
            assignedClasses = [] // Sınıf atamalarını req.body'den alalım
        } = req.body;
        
        console.log('Güncelleme isteği alındı - Form ID:', id);
        console.log('Gelen veriler:', req.body);
        console.log('Gelen sınıf atamaları:', assignedClasses);

        // Sınavı ID'sine göre bul
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Sınav bulunamadı"
            });
        }
        
        console.log('Mevcut form verisi:', exam);
        console.log('Mevcut sınıf atamaları:', exam.assignedClasses);

        // Okul kontrolü yapılırsa
        if (school && school !== exam.school.toString()) {
            const schoolExists = await School.findById(school);
            if (!schoolExists) {
                return res.status(404).json({
                    success: false,
                    message: "Okul bulunamadı"
                });
            }
        }

        // Sınıf kontrolü yapılırsa
        if (classId && classId !== exam.class?.toString()) {
            const classExists = await Class.findById(classId);
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: "Sınıf bulunamadı"
                });
            }
        }

        // Optik görseli güncelle
        let savedImagePath = exam.opticalFormImage;
        if (opticalFormImage && opticalFormImage.startsWith("data:image/")) {
            try {
                // Eski resmi sil (varsa)
                if (exam.opticalFormImage) {
                    const oldPath = path.join(process.cwd(), exam.opticalFormImage);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }

                // Yeni resmi kaydet
                const base64Data = opticalFormImage.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, "base64");
                const uploadDir = path.resolve("uploads");

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filename = `optical_${Date.now()}.png`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, buffer);
                savedImagePath = `/uploads/${filename}`;
            } catch (error) {
                console.error("Resim güncelleme hatası:", error);
                // Resim güncellenemezse de işleme devam et
            }
        }

        // Güncelleme yapılacak alanları belirle
        const updateData = {
            title: title || exam.title,
            school: school || exam.school,
            date: date || exam.date,
            class: classId || exam.class,
            studentIds: studentIds.length > 0 ? studentIds : exam.studentIds,
            isTemplate: isTemplate !== undefined ? isTemplate : exam.isTemplate,
            opticalFormImage: savedImagePath,
            components: components || exam.components,
            // Sınıf atamalarını ekle - gelen değer varsa onu kullan, yoksa mevcut değeri koru
            assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : exam.assignedClasses
        };
        
        console.log('Güncellenecek veriler:', updateData);
        console.log('Güncellenecek sınıf atamaları:', updateData.assignedClasses);

        // Sınavı güncelle
        const updatedExam = await Exam.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        console.log('Güncelleme sonrası veriler:', updatedExam);
        console.log('Güncelleme sonrası sınıf atamaları:', updatedExam.assignedClasses);

        res.status(200).json({
            success: true,
            message: "Sınav başarıyla güncellendi",
            data: updatedExam
        });

    } catch (error) {
        console.error("Sınav güncelleme hatası:", error);
        next(error);
    }
};


export const deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Sınav bulunamadı"
            });
        }

        // Optik form görselini sil (varsa)
        if (exam.opticalFormImage) {
            try {
                const imagePath = path.join(process.cwd(), exam.opticalFormImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (error) {
                console.error("Resim dosyası silinirken hata:", error);
                // Dosya silinemese bile sınav silmeye devam et
            }
        }

        await exam.deleteOne();

        res.status(200).json({
            success: true,
            message: "Sınav başarıyla silindi",
        });

    } catch (error) {
        next(error);
    }
};


export const getExamsBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;

        // Okul kontrolü
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Okul ID'sine göre sınavları getir
        const exams = await Exam.find({ school: schoolId })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
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


export const getTemplatesBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;
        // Okul kontrolü
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
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


export const getExamsByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;

        // Sınıf kontrolü
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        // Sınıf ID'sine göre sınavları getir
        const exams = await Exam.find({ class: classId })
            .populate("school", "name city")
            .populate("createdBy", "name email")
            .populate("class", "name grade")
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