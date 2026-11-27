const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./payment-method.dto");
const service = require("./payment-method.service");

module.exports = { path: "/payment-methods", router: createCrudRouter(createCrudController({ dto, service })) };
