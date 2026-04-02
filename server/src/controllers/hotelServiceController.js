const HotelService = require("../models/HotelService");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(HotelService, "Hotel service");
