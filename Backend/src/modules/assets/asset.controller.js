const dto = require("./asset.dto");
const service = require("./asset.service");
const { uuid } = require("../../shared/validation");

module.exports = {
  async list(req, res) {
    const filtros = dto.filters(req.query);
    const resultado = await service.list(req.user.id, filtros);
    res.json(resultado);
  },

  async find(req, res) {
    const id = uuid(req.params.id);
    const bem = await service.find(req.user.id, id);
    res.json(bem);
  },

  async create(req, res) {
    const dados = dto.parse(req.body);
    const novoBem = await service.create(req.user.id, dados);
    res.status(201).location(`${req.baseUrl}/${novoBem.id}`).json(novoBem);
  },

  async update(req, res) {
    const id = uuid(req.params.id);
    const dados = dto.parse(req.body, true);
    const bemAtualizado = await service.update(req.user.id, id, dados);
    res.json(bemAtualizado);
  },

  async remove(req, res) {
    const id = uuid(req.params.id);
    await service.remove(req.user.id, id);
    res.status(204).end();
  },
};
