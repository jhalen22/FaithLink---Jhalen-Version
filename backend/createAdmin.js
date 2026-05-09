const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const ADMIN = {
  fullName: "System Admin",
  email: "admin@faithlink.com",
  password: "admin123",
  role: "admin",
};

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB Atlas");

    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

    await User.create({
      fullName: ADMIN.fullName,
      email: ADMIN.email,
      password: hashedPassword,
      role: ADMIN.role,
    });

    console.log("Admin account created successfully");
    console.log(`  Email   : ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

createAdmin();
