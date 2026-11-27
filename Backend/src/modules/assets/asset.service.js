const repository = require("./asset.repository");
const { createService } = require("../../shared/crud");

module.exports = createService({ repository, notFound: "Bem não encontrado." });
