import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true },
    grade: { type: Number, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" , default: null}],
}, { timestamps: true });

export default mongoose.model("Class", ClassSchema);
