const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const PRIEST = {
  fullName: "Test Priest",
  email:    "priest@test.com",
  password: "123456",
  role:     "priest",
};

async function createPriest() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB Atlas");

    const existing = await User.findOne({ email: PRIEST.email });

    if (existing) {
      console.log("Priest already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(PRIEST.password, 12);

    await User.create({
      fullName: PRIEST.fullName,
      email:    PRIEST.email,
      password: hashedPassword,
      role:     PRIEST.role,
    });

    console.log("Priest account created successfully");
    console.log(`  Email   : ${PRIEST.email}`);
    console.log(`  Password: ${PRIEST.password}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

createPriest();
