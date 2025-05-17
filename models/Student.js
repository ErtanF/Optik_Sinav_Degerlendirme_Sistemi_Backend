import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationalId: { type: String, unique: true },
    studentNumber: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Student", StudentSchema);
