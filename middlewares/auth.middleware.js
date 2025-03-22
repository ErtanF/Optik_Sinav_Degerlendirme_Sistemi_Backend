// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

// JWT token'ını doğrulayıp req.user'ı oluşturan middleware
export const authenticateUser = (req, res, next) => {
    try {
        // Authorization header'ından token'ı al
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Yetkilendirme başarısız: Token sağlanmadı" });
        }

        // Token'ı ayıkla
        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kullanıcı bilgilerini req.user'a ekle
        req.user = decoded;

        // Sonraki middleware'e geç
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Yetkilendirme başarısız: Geçersiz token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Yetkilendirme başarısız: Token süresi dolmuş" });
        }
        return res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

// Superadmin kontrolü
export const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Yetkilendirme gerekiyor" });
    }

    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Bu işlem için superadmin yetkisi gerekiyor" });
    }

    next();
};

// Admin kontrolü (superadmin de admin işlemlerini yapabilir)
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Yetkilendirme gerekiyor" });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Bu işlem için admin yetkisi gerekiyor" });
    }

    next();
};

// Okula özgü admin kontrolü - Sadece kendi okulundaki öğretmenleri onaylayabilir
export const isSchoolAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Yetkilendirme gerekiyor" });
    }

    // Superadmin her okul için işlem yapabilir
    if (req.user.role === 'superadmin') {
        return next();
    }

    // Admin rolüne sahip mi?
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Bu işlem için admin yetkisi gerekiyor" });
    }

    // Okul ID'si var mı?
    if (!req.user.schoolId) {
        return res.status(403).json({ message: "Admin kullanıcısının okul bilgisi bulunamadı" });
    }

    // İstekteki okul ID'si ile admin'in okul ID'si eşleşiyor mu?
    // Bu kısım, isteğin içeriğine bağlı olarak değişebilir
    // Örneğin öğretmen bilgisinden okul ID'si alabiliriz
    const teacherSchoolId = req.body.schoolId;

    if (teacherSchoolId && teacherSchoolId.toString() !== req.user.schoolId.toString()) {
        return res.status(403).json({
            message: "Sadece kendi okulunuzdaki öğretmenleri onaylayabilirsiniz"
        });
    }

    next();
};