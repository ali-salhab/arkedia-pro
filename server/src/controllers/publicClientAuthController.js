const asyncHandler = require("../middleware/asyncHandler");
const ClientAccount = require("../models/ClientAccount");

function sanitizeClient(clientDoc) {
  return {
    _id: clientDoc._id,
    name: clientDoc.name,
    email: clientDoc.email,
    createdAt: clientDoc.createdAt,
  };
}

const signup = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  const client = await ClientAccount.create({ name, email, password });

  res.status(201).json({ client: sanitizeClient(client) });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const client = await ClientAccount.findOne({ email }).select("+password");
  if (!client) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const validPassword = await client.comparePassword(password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ client: sanitizeClient(client) });
});

module.exports = { signup, login };