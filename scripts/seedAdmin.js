import mongoose from "mongoose"; 
import dotenv from "dotenv";
import { User } from "../src/models/user.model.js";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: "admin@example.com" });
  if (!exists) {
    await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "admin1234",
      role: "admin"
    });
    console.log("Admin created: admin@example.com / admin1234");
  } else {
    console.log("Admin already exists");
  }
  process.exit(0);
};

seed();
