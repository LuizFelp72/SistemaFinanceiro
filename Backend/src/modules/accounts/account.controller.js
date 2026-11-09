const dto = require("./account.dto");
const service = require("./account.service");
const { uuid } = require("../../shared/validation");

module.exports = {
  async list(req, res) {
    res.json(await service.list(req.user.id, dto.filters(req.query)));
  },
  async find(req, res) {
    res.json(await service.find(req.user.id, uuid(req.params.id)));
  },
  async create(req, res) {
    const record = await service.create(req.user.id, dto.parse(req.body));
    res.status(201).location(`${req.baseUrl}/${record.id}`).json(record);
  },
  async update(req, res) {
    res.json(await service.update(req.user.id, uuid(req.params.id), dto.parse(req.body, true)));
  },
  async remove(req, res) {
    await service.remove(req.user.id, uuid(req.params.id));
    res.status(204).end();
  },
};
