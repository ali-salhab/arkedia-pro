const asyncHandler = require("../middleware/asyncHandler");

const PLATFORM_ROLES = new Set(["super_admin", "superadminuser"]);
const MANAGER_ROLES = new Set(["admin", "hotel", "restaurant", "activity"]);

function getScopedOwnerId(user) {
  if (!user) return null;
  const requesterId = user._id || user.sub || null;

  if (PLATFORM_ROLES.has(user.role)) {
    return null;
  }

  if (MANAGER_ROLES.has(user.role)) {
    return requesterId;
  }

  return user.adminId || null;
}

function buildCrudControllers(Model, name) {
  const list = asyncHandler(async (req, res) => {
    const ownerId = getScopedOwnerId(req.user);
    // Platform roles see everything; non-platform roles are scoped by admin ownership.
    const filter = ownerId
      ? { adminId: ownerId }
      : PLATFORM_ROLES.has(req.user?.role)
        ? {}
        : { _id: null };
    const data = await Model.find(filter);
    res.json(data);
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: `${name} not found` });
    return res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    const ownerId = getScopedOwnerId(req.user);
    if (req.user && !PLATFORM_ROLES.has(req.user.role)) {
      body.adminId = ownerId;
      if (req.user.hotelId && !body.hotelId) body.hotelId = req.user.hotelId;
      if (req.user.restaurantId && !body.restaurantId) body.restaurantId = req.user.restaurantId;
      if (req.user.activityId && !body.activityId) body.activityId = req.user.activityId;
    }
    const item = await Model.create(body);
    res.status(201).json(item);
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: `${name} not found` });
    return res.json(item);
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: `${name} not found` });
    return res.json({ message: `${name} deleted` });
  });

  return { list, getOne, create, update, remove };
}

module.exports = { buildCrudControllers };
