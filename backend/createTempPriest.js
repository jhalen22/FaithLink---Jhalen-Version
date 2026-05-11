const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const TEMP_PRIEST = {
  fullName: "Temp Priest",
  email:    "priest@faithlink.com",
  password: "FaithLink123",
  role:     "priest",
};

async function createTempPriest() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB Atlas");

    const existing = await User.findOne({ email: TEMP_PRIEST.email });

    if (existing) {
      console.log("Account already exists:", TEMP_PRIEST.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(TEMP_PRIEST.password, 12);

    await User.create({
      fullName: TEMP_PRIEST.fullName,
      email:    TEMP_PRIEST.email,
      password: hashedPassword,
      role:     TEMP_PRIEST.role,
    });

    console.log("Temporary priest account created successfully");
    console.log(`  Full Name: ${TEMP_PRIEST.fullName}`);
    console.log(`  Email    : ${TEMP_PRIEST.email}`);
    console.log(`  Password : ${TEMP_PRIEST.password}`);
    console.log(`  Role     : ${TEMP_PRIEST.role}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

createTempPriest();
