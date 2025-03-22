import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Sınav başlığı
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true }, // Sınavın yapıldığı okul
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Sınavı oluşturan öğretmen
    date: { type: Date, required: true }, // Sınav tarihi
    opticalFormImage: { type: String, required: true }, // Optik formun resmi (URL olarak kaydedilecek)
}, { timestamps: true });

export default mongoose.model("Exam", ExamSchema);
