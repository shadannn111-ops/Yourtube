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

async function uploadFile(file) {
  try {
    const filePath = path.join(uploadsFolder, file);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "yourtube_videos",
      public_id: file.split(".")[0],
    });
    console.log(`✅ Uploaded: ${file}`);
    return { file, url: result.secure_url };
  } catch (error) {
    console.error(`❌ Failed: ${file}`, error.message);
    return null;
  }
}

async function run() {
  try {
    console.log("MongoDB connect ho raha hai...");
    await mongoose.connect(DB_URL);
    console.log("MongoDB connected!");

    const files = fs.readdirSync(uploadsFolder).filter(f => f.endsWith(".mp4") || f.endsWith(".webm"));
    console.log(`Total videos: ${files.length}. Uploading in parallel...`);

    // ✅ Ek saath 5 videos upload karo (Parallel)
    const results = [];
    const chunkSize = 5;
    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map(uploadFile));
      results.push(...chunkResults.filter(r => r !== null));
    }

    console.log("\nSaari videos upload ho gayi! Ab Database update kar rahe hain...");

    // ✅ Database update ek saath
    const db = mongoose.connection.db.collection("videofiles");
    const videos = await db.find({}).toArray();

    for (const res of results) {
      const matched = await db.updateMany(
        { filepath: { $regex: res.file.split(".")[0] } },
        { $set: { filepath: res.url } }
      );
      if (matched.modifiedCount > 0) {
        console.log(`🔄 DB Updated: ${res.file}`);
      }
    }

    console.log("\n🎉 SAB KUCH HO GAYA! Ab site check karo.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();
