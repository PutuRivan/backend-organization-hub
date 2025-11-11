import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "node:path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join("public", "uploads")));
app.use(cookieParser(process.env.JWT_SECRET!));
// routes(app)

app.get("/", (req, res) => {
  res.send("Hello World!");
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
