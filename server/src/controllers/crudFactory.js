const asyncHandler = require("../middleware/asyncHandler");

function buildCrudControllers(Model, name) {
  const list = asyncHandler(async (req, res) => {
    const data = await Model.find();
    res.json(data);
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: `${name} not found` });
    return res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (req.user && req.user.role !== "super_admin") {
      body.adminId = req.user._id;
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
