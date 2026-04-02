const crypto = require("crypto");
const asyncHandler = require("../middleware/asyncHandler");
const ClientAccount = require("../models/ClientAccount");
const { sendVerificationEmail } = require("../utils/mailer");

function sanitizeClient(clientDoc) {
  return {
    _id: clientDoc._id,
    name: clientDoc.name,
    email: clientDoc.email,
    emailVerified: clientDoc.emailVerified,
    createdAt: clientDoc.createdAt,
  };
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function clientBaseUrl(req) {
  return (
    process.env.CLIENT_URL ||
    `${req.protocol}://${req.get("host")}`
  );
}

/* ─── POST /api/public-auth/signup ──────────────────────────────── */
const signup = asyncHandler(async (req, res) => {
  const name     = String(req.body?.name     || "").trim();
  const email    = String(req.body?.email    || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const token   = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

  const client = await ClientAccount.create({
    name,
    email,
    password,
    emailVerificationToken:   token,
    emailVerificationExpires: expires,
  });

  const verifyUrl = `${clientBaseUrl(req)}/verify-email?token=${token}`;

  try {
    await sendVerificationEmail({ toEmail: email, toName: name, verifyUrl });
  } catch (mailErr) {
    // Don't block the response — log and proceed
    console.error("[mailer] Failed to send verification email:", mailErr.message);
  }

  res.status(201).json({
    message: "Account created. Please check your email to verify your account.",
    email: client.email,
    emailVerified: false,
  });
});

/* ─── GET /api/public-auth/verify-email?token=… ─────────────────── */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  const client = await ClientAccount
    .findOne({ emailVerificationToken: token })
    .select("+emailVerificationToken +emailVerificationExpires");

  if (!client) {
    return res.status(400).json({ message: "Invalid or already-used verification link." });
  }

  if (client.emailVerificationExpires < new Date()) {
    return res.status(410).json({ message: "Verification link has expired. Please request a new one." });
  }

  client.emailVerified             = true;
  client.emailVerificationToken    = undefined;
  client.emailVerificationExpires  = undefined;
  await client.save();

  res.json({ message: "Email verified successfully.", client: sanitizeClient(client) });
});

/* ─── POST /api/public-auth/resend-verification ─────────────────── */
const resendVerification = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const client = await ClientAccount
    .findOne({ email })
    .select("+emailVerificationToken +emailVerificationExpires");

  if (!client) {
    // Respond generically to prevent email enumeration
    return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
  }

  if (client.emailVerified) {
    return res.status(400).json({ message: "This email is already verified." });
  }

  const token   = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  client.emailVerificationToken    = token;
  client.emailVerificationExpires  = expires;
  await client.save();

  const verifyUrl = `${clientBaseUrl(req)}/verify-email?token=${token}`;
  await sendVerificationEmail({ toEmail: email, toName: client.name, verifyUrl });

  res.json({ message: "If that email exists and is unverified, a new link has been sent." });
});

/* ─── POST /api/public-auth/login ───────────────────────────────── */
const login = asyncHandler(async (req, res) => {
  const email    = String(req.body?.email    || "").trim().toLowerCase();
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

  if (!client.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in.",
      emailVerified: false,
      email: client.email,
    });
  }

  res.json({ client: sanitizeClient(client) });
});

module.exports = { signup, login, verifyEmail, resendVerification };
