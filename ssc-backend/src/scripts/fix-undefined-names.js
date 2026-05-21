import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "SSC";
if (!MONGO_URI) { console.error("MONGO_URI not set"); process.exit(1); }

await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
const col = mongoose.connection.db.collection("users");

const count = await col.countDocuments({
  $or: [{ firstName: "undefined" }, { lastName: "undefined" }, { middleName: "undefined" }],
});
console.log(`Found ${count} user(s) with literal "undefined" in name fields`);

if (count > 0) {
  const result = await col.updateMany(
    { $or: [{ firstName: "undefined" }, { lastName: "undefined" }, { middleName: "undefined" }] },
    [{
      $set: {
        firstName:  { $cond: [{ $eq: ["$firstName",  "undefined"] }, "", "$firstName"]  },
        lastName:   { $cond: [{ $eq: ["$lastName",   "undefined"] }, "", "$lastName"]   },
        middleName: { $cond: [{ $eq: ["$middleName", "undefined"] }, "", "$middleName"] },
      },
    }]
  );
  console.log(`Fixed: ${result.modifiedCount} document(s)`);
}

await mongoose.disconnect();
console.log("Done.");
