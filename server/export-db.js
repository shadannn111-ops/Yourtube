import mongoose from "mongoose";
import fs from "fs";

const DB_URL = "mongodb://localhost:27017/youtubetube"; // Tumhara local DB

async function exportData() {
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ Local Database Connected!");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Total Collections: ${collections.length}`);

    const allData = {};

    for (const col of collections) {
      const name = col.name;
      const data = await mongoose.connection.db.collection(name).find({}).toArray();
      allData[name] = data;
      console.log(`📦 Exported ${name}: ${data.length} records`);
    }

    fs.writeFileSync("backup.json", JSON.stringify(allData, null, 2));
    console.log("🎉 Backup saved to backup.json!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

exportData();
