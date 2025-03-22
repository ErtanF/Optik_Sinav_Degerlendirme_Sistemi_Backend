import mongoose from "mongoose";
import User from "../models/user.js";
import School from "../models/school.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(req.body);
        const { name, email, password, schoolId } = req.body;

        // Kullanıcı daha önce kayıt olmuş mu?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        // Okul kontrolü
        const school = await School.findById(schoolId);
        if (!school) {
            const error = new Error("Selected school not found.");
            error.statusCode = 404;
            throw error;
        }

        // Şifreyi hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni öğretmeni oluştur
        const newTeacher = await User.create(
            [{
                name,
                email,
                password: hashedPassword,
                role: "teacher", // Sadece öğretmen kayıt olabilir
                school: schoolId,
                isApproved: false // Müdür onayı bekliyor
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Teacher registered successfully. Waiting for school admin approval.",
            data: {
                user: newTeacher[0],
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};


export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate("school");
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        // Eğer kullanıcı öğretmense ve henüz onaylanmamışsa giriş yapamaz.
        if (user.role === "teacher" && !user.isApproved) {
            return res.status(403).json({
                success: false,
                message: "Your account is waiting for approval from the school admin.",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                schoolId: user.school ? user.school._id : null, // Okul ID'sini ekle
                schoolName: user.school ? user.school.name : null // Okul adını ekle (opsiyonel)
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Token ve kullanıcı bilgilerini döndür (şifre hariç)
        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;

        res.status(200).json({
            message: "Giriş başarılı",
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};


export const signOut = async (req, res, next) => {};