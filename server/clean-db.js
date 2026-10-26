import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.DB_URL).then(async () => {
  const db = mongoose.connection.db.collection("videofiles");
  const result = await db.deleteMany({ filepath: { $regex: "cloudinary" } });
  console.log(`✅ Deleted ${result.deletedCount} videos from database`);
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
