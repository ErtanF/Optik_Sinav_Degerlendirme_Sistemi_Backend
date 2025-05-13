import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" , default: null }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" , default: null}],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" , default: null}],
}, { timestamps: true });

export default mongoose.model("School", SchoolSchema);
