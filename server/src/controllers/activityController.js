const Activity = require("../models/Activity");
const { buildCrudControllers } = require("./crudFactory");

module.exports = buildCrudControllers(Activity, "Activity");
