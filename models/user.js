import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "admin", "teacher"],
    required: true,
  },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" }, // Öğretmen ve Admin için
  isApproved: {
    type: Boolean,
    default: false,
    required: function() {
      return this.role === "teacher"; // sadece öğretmenler için zorunlu
    }
  }, // Öğretmenin onay durumu, yalnızca öğretmenler için
}, { timestamps: true });

// Modeli export et
export default mongoose.model("User", UserSchema);
