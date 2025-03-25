import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import {PORT, NODE_ENV} from "./config/env.js";
import connectDB from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import schoolRouter from "./routes/school.routes.js";
import userRouter from "./routes/user.routes.js";
import examRouter from "./routes/exam.routes.js";

// __dirname işlevselliğini ES modules için ekleme
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();

// CORS ayarları
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL'iniz
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// CORS middleware'ini ekleyin
app.use(cors(corsOptions));

// Diğer middleware'ler
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended:true}));
app.use(cookieParser());

// Statik dosyaları sunma - uploads klasörünü dışarıya aç
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotaları tanımlayın
app.use('/api/auth', authRouter);
app.use('/api/school', schoolRouter);
app.use('/api/user', userRouter);
app.use('/api/exam', examRouter);

// Hata middleware'i
app.use(errorMiddleware);

// Sunucuyu başlatın
app.listen(PORT, async () => {
  console.log("Server is running on port http://localhost:" + PORT);
  await connectDB();
});

export default app;