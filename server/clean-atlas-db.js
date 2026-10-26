import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ⚠️ Yahan apna Atlas URL daalo (jo step 1 me copy kiya)
const ATLAS_URL = "mongodb://admin:admin123@ac-37hqapo-shard-00-00.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-01.8csnxez.mongodb.net:27017,ac-37hqapo-shard-00-02.8csnxez.mongodb.net:27017/youtubetube?ssl=true&replicaSet=atlas-101nzc-shard-0&authSource=admin";

mongoose.connect(ATLAS_URL).then(async () => {
  const db = mongoose.connection.db.collection("videofiles");
  
  // ✅ Delete videos with local uploads path
  const result = await db.deleteMany({ 
    filepath: { $regex: "uploads" } 
  });
  
  console.log(`✅ Deleted ${result.deletedCount} old videos from Atlas`);
  process.exit();
}).catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
