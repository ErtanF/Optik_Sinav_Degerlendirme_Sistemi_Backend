import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import {PORT, NODE_ENV} from "./config/env.js";
import connectDB from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import schoolRouter from "./routes/school.routes.js";
import userRouter from "./routes/user.routes.js";

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rotaları tanımlayın
app.use('/api/auth', authRouter);
app.use('/api/school', schoolRouter);
app.use('/api/user', userRouter);

// Hata middleware'i
app.use(errorMiddleware);

// Sunucuyu başlatın
app.listen(PORT, async () => {
  console.log("Server is running on port http://localhost:" + PORT);
  await connectDB();
});

export default app;