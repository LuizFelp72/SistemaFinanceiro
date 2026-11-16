const dto = require("./goal.dto");
const service = require("./goal.service");
const { uuid } = require("../../shared/validation");

module.exports = {
  async list(req, res) {
    const filtros = dto.filters(req.query);
    const resultado = await service.list(req.user.id, filtros);
    res.json(resultado);
  },

  async find(req, res) {
    const id = uuid(req.params.id);
    const meta = await service.find(req.user.id, id);
    res.json(meta);
  },

  async create(req, res) {
    const dados = dto.parse(req.body);
    const novaMeta = await service.create(req.user.id, dados);
    res.status(201).location(`${req.baseUrl}/${novaMeta.id}`).json(novaMeta);
  },

  async update(req, res) {
    const id = uuid(req.params.id);
    const dados = dto.parse(req.body, true);
    const metaAtualizada = await service.update(req.user.id, id, dados);
    res.json(metaAtualizada);
  },

  async remove(req, res) {
    const id = uuid(req.params.id);
    await service.remove(req.user.id, id);
    res.status(204).end();
  },
};
