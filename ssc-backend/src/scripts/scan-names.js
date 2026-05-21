import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || "SSC" });
const col = mongoose.connection.db.collection("users");

// Case-insensitive regex catch + missing field + empty string
const suspect = await col.find({
  $or: [
    { firstName: { $regex: /^undefined$/i } },
    { lastName:  { $regex: /^undefined$/i } },
    { firstName: { $exists: false } },
    { lastName:  { $exists: false } },
    { firstName: "" },
    { lastName:  "" },
  ]
}, { projection: { email: 1, firstName: 1, lastName: 1, middleName: 1 } })
  .toArray();

if (!suspect.length) {
  console.log("All users have clean firstName/lastName. No suspect docs.");
} else {
  console.log(`${suspect.length} suspect doc(s):`);
  for (const u of suspect) {
    console.log(` email=${u.email}  firstName=${JSON.stringify(u.firstName)}  lastName=${JSON.stringify(u.lastName)}`);
  }
}

await mongoose.disconnect();
