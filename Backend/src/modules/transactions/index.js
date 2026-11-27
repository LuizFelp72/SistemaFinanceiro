const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./transaction.dto");
const service = require("./transaction.service");

module.exports = { path: "/transactions", router: createCrudRouter(createCrudController({ dto, service })) };
