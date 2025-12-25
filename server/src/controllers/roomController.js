const Room = require("../models/Room");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(Room, "Room");
