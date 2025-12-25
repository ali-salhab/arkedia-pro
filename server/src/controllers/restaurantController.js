const Restaurant = require("../models/Restaurant");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(Restaurant, "Restaurant");
