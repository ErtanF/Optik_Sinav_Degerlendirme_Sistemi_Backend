import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    score: { type: Number, required: true },
    answers: [
        {
            questionNumber: { type: Number, required: true },
            answer: { type: String, required: true },
            isCorrect: { type: Boolean, default: false }
        }
    ],
}, { timestamps: true });

export default mongoose.model('Result', ResultSchema);