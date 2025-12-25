require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const roleRoutes = require("./routes/roles");
const permissionRoutes = require("./routes/permissions");
const sidebarRoutes = require("./routes/sidebar");
const userRoutes = require("./routes/users");
const hotelRoutes = require("./routes/hotels");
const restaurantRoutes = require("./routes/restaurants");
const activityRoutes = require("./routes/activities");
const bookingRoutes = require("./routes/bookings");
const roomRoutes = require("./routes/rooms");
const financeRoutes = require("./routes/finance");
const reportRoutes = require("./routes/reports");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
});
