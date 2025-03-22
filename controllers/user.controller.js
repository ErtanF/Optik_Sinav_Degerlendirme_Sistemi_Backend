import User from "../models/user.js";
import School from "../models/school.js";
import bcrypt from "bcrypt";

/**
 * Süperadmin tarafından okul müdürü (admin) ekleme
 */
export const addAdmin = async (req, res, next) => {
    try {
        const { name, email, password, schoolId } = req.body;

        // Okulun var olup olmadığını kontrol et
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        // Okulun zaten bir admini var mı kontrol et
        if (school.admin) {
            return res.status(400).json({
                success: false,
                message: "This school already has an assigned admin"
            });
        }

        // Aynı email ile kayıtlı kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Admin already exists"
            });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni admini oluştur
        const newAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            school: schoolId,
            isApproved: true
        });

        // Okula admini ata
        school.admin = newAdmin._id;
        await school.save();

        res.status(201).json({
            success: true,
            message: "School admin added successfully",
            data: newAdmin
        });

    } catch (error) {
        next(error);
    }
};

// controllers/user.controller.js
export const approveTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.body; // Onaylanacak öğretmenin ID'si

        // Öğretmen var mı kontrol et
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        // Öğretmenin zaten onaylanmış olup olmadığını kontrol et
        if (teacher.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Teacher is already approved"
            });
        }

        // Öğretmenin bağlı olduğu okul var mı kontrol et
        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        // Kullanıcının rolünü ve yetkisini kontrol et
        // Eğer admin ise, kendi okulundaki öğretmenleri onaylayabilir
        if (req.user.role === 'admin') {
            // Admin'in kendi okul ID'si ile öğretmenin okul ID'sini karşılaştır
            if (req.user.schoolId.toString() !== teacher.school.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You can only approve teachers from your own school"
                });
            }
        }
        // Eğer superadmin değilse, işlemi reddet
        else if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to approve teachers"
            });
        }

        // Öğretmeni onayla ve okula ekle
        teacher.isApproved = true;
        await teacher.save();

        // Eğer school.teachers dizisi yoksa oluştur
        if (!school.teachers) {
            school.teachers = [];
        }

        // Öğretmeni henüz okul listesinde yoksa ekle
        if (!school.teachers.includes(teacher._id)) {
            school.teachers.push(teacher._id);
            await school.save();
        }

        res.status(200).json({
            success: true,
            message: "Teacher approved successfully",
            data: teacher
        });

    } catch (error) {
        next(error);
    }
};