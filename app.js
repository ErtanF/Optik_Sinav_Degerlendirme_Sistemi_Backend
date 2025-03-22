import express from "express";
import cookieParser from "cookie-parser";

import {PORT , NODE_ENV } from "./config/env.js";
import connectDB from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import schoolRouter from "./routes/school.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/school', schoolRouter);
app.use('/api/user', userRouter);


app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log("Server is running on port http://localhost:" + PORT);
  await connectDB();
});

export default app;
