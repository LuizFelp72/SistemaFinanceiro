const dto = require("./category.dto");
const service = require("./category.service");
const { uuid } = require("../../shared/validation");

module.exports = {
  async list(req, res) {
    const filtros = dto.filters(req.query);
    const resultado = await service.list(req.user.id, filtros);
    res.json(resultado);
  },

  async find(req, res) {
    const id = uuid(req.params.id);
    const categoria = await service.find(req.user.id, id);
    res.json(categoria);
  },

  async create(req, res) {
    const dados = dto.parse(req.body);
    const novaCategoria = await service.create(req.user.id, dados);
    res.status(201).location(`${req.baseUrl}/${novaCategoria.id}`).json(novaCategoria);
  },

  async update(req, res) {
    const id = uuid(req.params.id);
    const dados = dto.parse(req.body, true);
    const categoriaAtualizada = await service.update(req.user.id, id, dados);
    res.json(categoriaAtualizada);
  },

  async remove(req, res) {
    const id = uuid(req.params.id);
    await service.remove(req.user.id, id);
    res.status(204).end();
  },
};
