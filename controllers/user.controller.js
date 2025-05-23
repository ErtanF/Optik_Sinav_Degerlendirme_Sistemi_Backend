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
                message: "Okul bulunamadı"
            });
        }

        // Okulun zaten bir admini var mı kontrol et
        if (school.admin) {
            return res.status(400).json({
                success: false,
                message: "Bu okulun zaten atanmış bir yöneticisi var"
            });
        }

        // Aynı email ile kayıtlı kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Bu yönetici zaten kayıtlı."
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
            message: "Okul yöneticisi başarıyla eklendi",
            data: newAdmin
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Öğretmen onaylama işlemi
 */
export const approveTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.body; // Onaylanacak öğretmenin ID'si

        // Öğretmen var mı kontrol et
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({
                success: false,
                message: "Öğretmen bulunamadı"
            });
        }

        // Öğretmenin zaten onaylanmış olup olmadığını kontrol et
        if (teacher.isApproved) {
            return res.status(400).json({
                success: false,
                message: "Öğretmen zaten onaylanmış"
            });
        }

        // Öğretmenin bağlı olduğu okul var mı kontrol et
        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Kullanıcının rolünü ve yetkisini kontrol et
        // Eğer admin ise, kendi okulundaki öğretmenleri onaylayabilir
        if (req.user.role === 'admin') {
            // Admin'in kendi okul ID'si ile öğretmenin okul ID'sini karşılaştır
            if (req.user.schoolId.toString() !== teacher.school.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Sadece kendi okulunuzdaki öğretmenleri onaylayabilirsiniz"
                });
            }
        }
        // Eğer superadmin değilse, işlemi reddet
        else if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: "Bu işlemi gerçekleştirmek için yeterli yetkiniz yok"
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
            message: "Öğretmen başarıyla onaylandı",
            data: teacher
        });

    } catch (error) {
        next(error);
    }
};
/**
 * Onaylanmamış öğretmenleri listeleme
 */
export const getApproveTeacher = async (req, res, next) => {

    try {

        let filter = { role: "teacher", isApproved: false };
        // Eğer kullanıcı 'superadmin' ise, tüm onaylanmamış öğretmenleri getir
        if (req.user.role !== 'superadmin') {
            // Kullanıcının okulundaki öğretmenleri getir
            filter.school = req.user.schoolId;
        }

        // Öğretmenleri filtrele ve okul bilgilerini de dahil et
        const teachers = await User.find(filter).populate("school");

        res.status(200).json({
            success: true,
            data: teachers
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {

    try {
        const { name, email } = req.body;
        const userId = req.user.userId;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı"
            });
        }

        // Email adresinin başka bir kullanıcıda olup olmadığını kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            return res.status(409).json({
                success: false,
                message: "Bu email adresi başka bir kullanıcıya ait"
            });
        }

        // Kullanıcı bilgilerini güncelle
        user.name = name;
        user.email = email;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profil başarıyla güncellendi",
            data: user
        });

    } catch (error) {
        next(error);
    }
}
export const getProfile = async (req, res, next) => {

    try {
        const userId = req.user.userId;

        // Kullanıcıyı bul
        const user = await User.findById(userId).populate("school");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }


}
export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId; // DİKKAT: userId!

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mevcut şifre yanlış, lütfen tekrar deneyin"
            });
        }

        // Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Şifreyi güncelle
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Şifre başarıyla değiştirildi"
        });

    } catch (error) {
        next(error);
    }
};

export const getApprovedTeachersBySchool = async (req, res, next) => {
    try {
        // Kullanıcının admin olup olmadığını kontrol et
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Bu kaynağa sadece okul yöneticileri erişebilir"
            });
        }

        // Admin'in okulundaki onaylanmış öğretmenleri getir
        const teachers = await User.find({
            role: "teacher",
            isApproved: true,
            school: req.user.schoolId
        }).populate("school");

        res.status(200).json({
            success: true,
            data: teachers
        });

    } catch (error) {
        next(error);
    }
};

export const getAllApprovedTeachers = async (req, res, next) => {
    try {
        // Kullanıcının superadmin olup olmadığını kontrol et
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: "Bu kaynağa sadece süper yöneticiler erişebilir"
            });
        }

        // Tüm onaylanmış öğretmenleri getir
        const teachers = await User.find({
            role: "teacher",
            isApproved: true
        }).populate("school");

        res.status(200).json({
            success: true,
            data: teachers
        });

    } catch (error) {
        next(error);
    }
}
