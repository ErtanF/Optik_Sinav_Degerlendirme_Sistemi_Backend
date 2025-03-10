import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// 🆕 Root (Ana Sayfa) Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Optik Sınav Değerlendirme Sistemi Backend!" });
});

// API Routes
app.use("/api", routes);

export default app;
