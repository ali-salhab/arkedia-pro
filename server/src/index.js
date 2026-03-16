require("dotenv").config({
  path: require("path").resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`,
  ),
});
const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
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
const socketStore = require("./utils/socketStore");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Socket.IO — allow same origins as CORS
const io = new SocketServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
});
socketStore.init(io);

io.on("connection", (socket) => {
  // Each authenticated client joins a room named after their userId
  socket.on("join", (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
  socket.on("disconnect", () => {});
});

// ── CORS ── must be the very first middleware, before helmet and everything else
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow the requesting origin (or * when no origin header)
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With",
  );
  // Answer all preflight requests immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
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
  server.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
});
