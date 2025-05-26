// models/OpticalTemplate.js
import mongoose from "mongoose";

const OpticalTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    opticalFormImage: { type: String },
    components: { type: Array, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("OpticalTemplate", OpticalTemplateSchema);
