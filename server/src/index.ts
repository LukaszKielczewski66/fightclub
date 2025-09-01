import mongoose from "mongoose";
import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fightclub";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);
  const app = createApp();
  app.listen(PORT, () => console.log(`API on :${PORT}`));
}
bootstrap().catch((e) => { console.error(e); process.exit(1); });
