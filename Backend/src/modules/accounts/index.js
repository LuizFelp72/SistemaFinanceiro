const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./account.dto");
const service = require("./account.service");

module.exports = { path: "/accounts", router: createCrudRouter(createCrudController({ dto, service })) };
