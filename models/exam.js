import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    opticalFormImage: { type: String, required: true }, // Optik formun kaydedildiği görsel yolu
    components: { type: Array, required: true } // Bileşen bilgileri (JSON formatında)
}, { timestamps: true });

export default mongoose.model("Exam", ExamSchema);
