import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationalId: { type: String, unique: true },
    studentNumber: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    bookletType: { type: String, enum: ["A", "B", "C", "D"], default: "A" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String },
}, { timestamps: true });

export default mongoose.model("Student", StudentSchema);
