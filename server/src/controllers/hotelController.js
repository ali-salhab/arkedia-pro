const Hotel = require("../models/Hotel");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(Hotel, "Hotel");
