import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" , default: null},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" , default: null }],
    opticalFormImage: { type: String },
    components: { type: Array, required: true },
    isTemplate: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Exam", ExamSchema);
