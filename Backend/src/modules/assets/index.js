const { createCrudController, createCrudRouter } = require("../../shared/crud");
const dto = require("./asset.dto");
const service = require("./asset.service");

module.exports = { path: "/assets", router: createCrudRouter(createCrudController({ dto, service })) };
