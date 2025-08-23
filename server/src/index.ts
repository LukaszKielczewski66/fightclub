import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express + TypeScript!" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
