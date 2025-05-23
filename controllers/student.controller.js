import Student from "../models/Student.js";
import Class from "../models/Class.js";
import School from "../models/school.js";
import User from "../models/user.js";
import mongoose from "mongoose";

/**
 * Tekil öğrenci ekleme
 */
export const addStudent = async (req, res, next) => {
    try {
        const { firstName, lastName, nationalId, studentNumber, classId } = req.body;
        const userId = req.user.userId;
        const schoolId = req.user.schoolId;
// Sınıfın varlığını kontrol et
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Sınıf Bulunamadı"
            });
        }

        // Öğrenci numarasının varlığını kontrol et
        const studentExists = await Student.findOne({ studentNumber });
        if (studentExists) {
            return res.status(400).json({
                success: false,
                message: "Bu öğrenci numarası daha önce alınmış."
            });
        }

        // Okulun varlığını kontrol et
        const schoolExists = await School.findById(schoolId);
        if (!schoolExists) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Öğrenci oluştur
        const newStudent = await Student.create({
            firstName,
            lastName,
            nationalId,
            studentNumber,
            class: classId,
            school: schoolId,
            createdBy: new mongoose.Types.ObjectId(userId)
        });

        // Sınıfa öğrenci ekle
        classExists.students.push(newStudent._id);
        await classExists.save();

        // Okula öğrenci ekle
        schoolExists.students.push(newStudent._id);
        await schoolExists.save();

        res.status(201).json({
            success: true,
            message: "Öğrenci başarıyla eklendi",
            data: newStudent
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Toplu öğrenci ekleme
 */
export const addStudentsFromList = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { students } = req.body; // Gelen öğrenci listesi
        const addedStudents = []; // Başarıyla eklenen öğrenciler
        const userId = req.user.userId;
        const schoolId = req.user.schoolId;
        for (let studentData of students) {
            const { firstName, lastName, nationalId, studentNumber, classId} = studentData;

            // Sınıfın varlığını kontrol et
            const classExists = await Class.findById(classId).session(session);
            if (!classExists) {
                throw new Error(`${classId} id'li sınıf bulunamadı`);
            }

            // Öğrenci numarasının varlığını kontrol et
            const studentExists = await Student.findOne({ studentNumber }).session(session);
            if (studentExists) {
                throw new Error(`${studentNumber} numaralı öğrenci zaten mevcut`);
            }

            // Okulun varlığını kontrol et
            const schoolExists = await School.findById(schoolId).session(session);
            if (!schoolExists) {
                throw new Error(`${schoolId} id'li okul bulunamadı`);
            }

            // Öğrenci oluştur
            const newStudent = await Student.create(
                [{
                    firstName,
                    lastName,
                    nationalId,
                    studentNumber,
                    class: classId,
                    school: schoolId,
                    createdBy: new mongoose.Types.ObjectId(userId)
                }],
                { session }
            );

            // Sınıfa öğrenci ekle
            classExists.students.push(newStudent[0]._id);
            await classExists.save({ session });

            // Okula öğrenci ekle
            schoolExists.students.push(newStudent[0]._id);
            await schoolExists.save({ session });

            addedStudents.push(newStudent[0]); // Başarıyla eklenen öğrenciyi listeye ekle
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Öğrenciler başarıyla eklendi",
            data: addedStudents
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Sınıfa göre öğrencileri getir
 */
export const getStudentsByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;

        // Sınıfın varlığını kontrol et
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        // Sınıfa ait öğrencileri getir
        const students = await Student.find({ class: classId })
            .populate("class")
            .populate("school");

        res.status(200).json({
            success: true,
            data: students
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ID'ye göre öğrenci getir
 */
export const getStudentById = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Öğrencinin varlığını kontrol et
        const studentExists = await Student.findById(studentId)
            .populate("class")
            .populate("school");
        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Öğrenci bulunamadı"
            });
        }

        res.status(200).json({
            success: true,
            data: studentExists
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Öğrenci bilgilerini güncelle
 */
export const updateStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const schoolId = req.user.schoolId;
        const { firstName, lastName, nationalId, studentNumber, classId } = req.body;

        // Öğrencinin varlığını kontrol et
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Öğrenci bulunamadı"
            });
        }

        // Sınıfın varlığını kontrol et
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Sınıf bulunamadı"
            });
        }

        // Okulun varlığını kontrol et
        const schoolExists = await School.findById(schoolId);
        if (!schoolExists) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Sınıf değişirse eski sınıftan öğrenciyi çıkar, yeni sınıfa ekle
        if (studentExists.class.toString() !== classId) {
            // Eski sınıftan çıkar
            const oldClass = await Class.findById(studentExists.class);
            if (oldClass) {
                oldClass.students = oldClass.students.filter(
                    id => id.toString() !== studentId
                );
                await oldClass.save();
            }

            // Yeni sınıfa ekle
            if (!classExists.students.includes(studentId)) {
                classExists.students.push(studentId);
                await classExists.save();
            }
        }

        // Okul değişirse eski okuldan öğrenciyi çıkar, yeni okula ekle
        if (studentExists.school.toString() !== schoolId) {
            // Eski okuldan çıkar
            const oldSchool = await School.findById(studentExists.school);
            if (oldSchool) {
                oldSchool.students = oldSchool.students.filter(
                    id => id.toString() !== studentId
                );
                await oldSchool.save();
            }

            // Yeni okula ekle
            if (!schoolExists.students.includes(studentId)) {
                schoolExists.students.push(studentId);
                await schoolExists.save();
            }
        }

        // Öğrenciyi güncelle
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                firstName,
                lastName,
                nationalId,
                studentNumber,
                class: classId,
                school: schoolId,
                createdBy: studentExists.createdBy
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Öğrenci bilgileri güncellendi",
            data: updatedStudent
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Öğrenciyi sil
 */
export const deleteStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Öğrencinin varlığını kontrol et
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Öğrenci bulunamadı"
            });
        }

        // Sınıftan öğrenciyi çıkar
        const classObj = await Class.findById(studentExists.class);
        if (classObj) {
            classObj.students = classObj.students.filter(
                id => id.toString() !== studentId
            );
            await classObj.save();
        }

        // Okuldan öğrenciyi çıkar
        const school = await School.findById(studentExists.school);
        if (school) {
            school.students = school.students.filter(
                id => id.toString() !== studentId
            );
            await school.save();
        }

        // Öğrenciyi sil
        await Student.findByIdAndDelete(studentId);

        res.status(200).json({
            success: true,
            message: "Öğrenci başarıyla silindi"
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Okula göre öğrencileri getir
 */
export const getStudentsBySchool = async (req, res, next) => {
    try {
        const schoolId = req.user.schoolId;

        // Okulun varlığını kontrol et
        const schoolExists = await School.findById(schoolId);
        if (!schoolExists) {
            return res.status(404).json({
                success: false,
                message: "Okul bulunamadı"
            });
        }

        // Okula ait öğrencileri getir
        const students = await Student.find({ school: schoolId })
            .populate("class")
            .populate("school");

        res.status(200).json({
            success: true,
            data: students
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Oluşturan kullanıcıya göre öğrencileri getir
 */
export const getStudentByCreator = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        // Kullanıcının varlığını kontrol et
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı"
            });
        }

        // Kullanıcıya ait öğrencileri getir
        const students = await Student.find({ createdBy: userId })
            .populate("class")
            .populate("school");

        res.status(200).json({
            success: true,
            data: students
        });

    } catch (error) {
        next(error);
    }
};


export const getStudents = async (req, res, next) => {
    try {
        const students = await Student.find()
            .populate("class")
            .populate("school");

        res.status(200).json({
            success: true,
            data: students
        });

    } catch (error) {
        next(error);
    }
}