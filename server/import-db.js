import mongoose from "mongoose";
import fs from "fs";

// ⚠️ Yahan apna naya link daalo (admin123 ki jagah apna asli password)
const ATLAS_URL = "mongodb://admin:admin123@ac-37hqapo-shard-00-00.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-01.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-02.8csnxez.mongodb.net:27017/youtubetube?ssl=true&replicaSet=atlas-101nzc-shard-0&authSource=admin";

async function importData() {
  try {
    console.log("Connecting to Atlas...");
    await mongoose.connect(ATLAS_URL);
    console.log("✅ Atlas Connected!");

    const backupData = JSON.parse(fs.readFileSync("backup.json", "utf-8"));
    const db = mongoose.connection.db;

    for (const [collectionName, data] of Object.entries(backupData)) {
      if (data.length === 0) continue;
      await db.collection(collectionName).insertMany(data);
      console.log(`✅ Imported ${collectionName}: ${data.length} records`);
    }

    console.log("🎉 SAARA DATA ATLAS ME IMPORT HO GAYA!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

importData();
