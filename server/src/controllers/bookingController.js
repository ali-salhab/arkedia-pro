const Booking = require("../models/Booking");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(Booking, "Booking");
