const Icon = require("../models/Icon");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const socketStore = require("../utils/socketStore");

const SUPER_ADMIN_ROLES = new Set(["super_admin", "superadminuser"]);

// GET /api/icons — super admin sees all; everyone else sees only designed icons
const list = asyncHandler(async (req, res) => {
  const isSuperAdmin = SUPER_ADMIN_ROLES.has(req.user?.role);
  const filter = isSuperAdmin ? {} : { status: "designed" };
  const icons = await Icon.find(filter).sort({ category: 1, label: 1 });
  res.json(icons);
});

// GET /api/icons/requests — super admin only: pending icon requests
const listRequests = asyncHandler(async (req, res) => {
  const icons = await Icon.find({ status: "requested" }).sort({
    createdAt: -1,
  });
  res.json(icons);
});

// POST /api/icons — super admin creates a designed icon
const create = asyncHandler(async (req, res) => {
  const icon = await Icon.create({
    ...req.body,
    status: "designed",
    createdBy: req.user._id,
  });
  res.status(201).json(icon);
});

// POST /api/icons/request — hotel requests a custom icon (no design yet)
const requestIcon = asyncHandler(async (req, res) => {
  const { label, labelAr, category } = req.body;
  if (!label?.trim()) {
    return res.status(400).json({ message: "Label is required" });
  }

  // Find requesting user's hotel name for the notification message
  const Hotel = require("../models/Hotel");
  const userId = req.user._id;
  const hotel =
    (await Hotel.findOne({ manager: userId })) ||
    (await Hotel.findOne({ adminId: req.user.adminId })) ||
    null;
  const hotelName = hotel?.name || req.user.role;

  const icon = await Icon.create({
    label: label.trim(),
    labelAr: labelAr?.trim() || "",
    category: category || "hotel",
    status: "requested",
    requestedBy: userId,
    requestedByHotelName: hotelName,
    createdBy: userId,
  });

  // Emit real-time notification to every super-admin
  const io = socketStore.getIo();
  if (io) {
    const superAdmins = await User.find({
      role: { $in: ["super_admin", "superadminuser"] },
    }).select("_id");
    superAdmins.forEach((sa) => {
      io.to(`user:${sa._id}`).emit("icon:requested", {
        iconId: icon._id,
        label: icon.label,
        hotelName,
        time: new Date().toISOString(),
      });
    });
  }

  res.status(201).json(icon);
});

// PUT /api/icons/:id — super admin updates icon (upload design, change details)
const update = asyncHandler(async (req, res) => {
  const icon = await Icon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!icon) return res.status(404).json({ message: "Icon not found" });

  // If the icon was just designed (promoted from requested) notify the requesting hotel user
  if (req.body.status === "designed" && icon.requestedBy) {
    const io = socketStore.getIo();
    if (io) {
      io.to(`user:${icon.requestedBy}`).emit("icon:designed", {
        iconId: icon._id,
        label: icon.label,
        imageUrl: icon.imageUrl,
        time: new Date().toISOString(),
      });
    }
  }

  return res.json(icon);
});

// DELETE /api/icons/:id — super admin deletes icon
const remove = asyncHandler(async (req, res) => {
  const icon = await Icon.findByIdAndDelete(req.params.id);
  if (!icon) return res.status(404).json({ message: "Icon not found" });
  return res.json({ message: "Icon deleted" });
});

module.exports = { list, listRequests, create, requestIcon, update, remove };
