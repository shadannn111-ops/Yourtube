import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DB_URL = process.env.DB_URL;
const uploadsFolder = path.join(process.cwd(), "uploads");

async function run() {
  try {
    console.log("MongoDB connect ho raha hai...");
    await mongoose.connect(DB_URL);
    console.log("MongoDB connected!");

    // Saari videos list karo
    const files = fs.readdirSync(uploadsFolder);
    console.log(`Total files mile: ${files.length}`);

    for (const file of files) {
      if (!file.endsWith(".mp4") && !file.endsWith(".webm")) continue;

      console.log(`\nUploading: ${file}`);
      const filePath = path.join(uploadsFolder, file);
      
      // Cloudinary pe upload karo
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
        folder: "yourtube_videos",
        public_id: file.split(".")[0], // File name as ID
      });

      console.log(`✅ Cloudinary URL: ${result.secure_url}`);

      // Database me purana path dhundo aur naya update karo
      const db = mongoose.connection.db.collection("videofiles");
      const videos = await db.find({}).toArray();
      
      // File ka naam match karke update karo
      const matched = await db.updateMany(
        { filepath: { $regex: file.split(".")[0] } },
        { $set: { filepath: result.secure_url } }
      );

      if (matched.modifiedCount > 0) {
        console.log(`🔄 Database me ${matched.modifiedCount} video ka link update ho gaya`);
      } else {
        console.log(`⚠️ Database me is file ka koi record nahi mila (Iska matlab ye video pehle upload nahi hui thi)`);
      }
    }

    console.log("\n🎉 SAARI VIDEOS CLOUDINARY PE UPLOAD HO GAYI AUR DATABASE UPDATE HO GAYA!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();
