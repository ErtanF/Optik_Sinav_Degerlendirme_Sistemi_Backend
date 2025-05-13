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
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" }, // admin/teacher
  isApproved: {
    type: Boolean,
    default: false,
    required: function () {
      return this.role === "teacher";
    },
  },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
