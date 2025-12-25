const User = require("../models/User");
const { buildCrudControllers } = require("./crudFactory");

const base = buildCrudControllers(User, "User");

module.exports = base;
