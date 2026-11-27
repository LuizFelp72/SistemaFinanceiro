const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./category.dto");
const service = require("./category.service");

module.exports = { path: "/categories", router: createCrudRouter(createCrudController({ dto, service })) };
