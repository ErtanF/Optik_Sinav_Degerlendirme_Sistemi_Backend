import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Okul adı
    city: { type: String, required: true }, // Şehir
    address: { type: String, required: true }, // Adres bilgisi
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default : null }, // Okul müdürü
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Öğretmenler
}, { timestamps: true });

export default mongoose.model("School", SchoolSchema);
