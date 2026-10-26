import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const hashPassword = (password) => crypto.createHash("sha256").update(password).digest("hex");

// ⚠️ Yahan apna Atlas wala link daalo
const ATLAS_URL = "mongodb://admin:admin123@ac-37hqapo-shard-00-00.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-01.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-02.8csnxez.mongodb.net:27017/youtubetube?ssl=true&replicaSet=atlas-101nzc-shard-0&authSource=admin";

// ⚠️ Yahan wo email daalo jiska password reset karna hai
const USER_EMAIL = "1@gmail.com"; 

mongoose.connect(ATLAS_URL).then(async () => {
  const db = mongoose.connection.db.collection("users");
  
  const result = await db.updateOne(
    { email: USER_EMAIL },
    { $set: { password: hashPassword("123456") } }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ Password reset successful! Login with: ${USER_EMAIL} / 123456`);
  } else {
    console.log(`❌ User not found with email: ${USER_EMAIL}`);
  }
  process.exit();
}).catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
