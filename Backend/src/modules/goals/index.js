const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./goal.dto");
const service = require("./goal.service");

module.exports = { path: "/goals", router: createCrudRouter(createCrudController({ dto, service })) };
