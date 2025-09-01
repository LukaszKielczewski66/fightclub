import mongoose from "mongoose";
import { User } from "../models/User";
import { hashPassword } from "../utils/auth";

async function run() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fightclub";
  await mongoose.connect(MONGO_URI);
  const email = "admin@club.local";
  const exists = await User.findOne({ email });
  if (!exists) {
    const passwordHash = await hashPassword("Admin123!");
    await User.create({ email, name: "Admin", role: "admin", passwordHash, active: true });
    console.log("Admin created:", email, "password=Admin123!");
  } else {
    console.log("Admin already exists");
  }
  await mongoose.disconnect();
}

run().catch(console.error);
