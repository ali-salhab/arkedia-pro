const mongoose = require("mongoose");

// Prevent unhandled 'error' events on the connection from crashing the process
mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] connection error:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] reconnected");
});

async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "booking_platform" });
  console.log("Mongo connected");
}

module.exports = connectDb;
