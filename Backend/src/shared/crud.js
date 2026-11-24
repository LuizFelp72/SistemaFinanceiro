const express = require("express");
const { uuid } = require("./validation");
const { AppError } = require("./errors");

function ensureFound(record, message) {
  if (!record) throw new AppError(404, message);
  return record;
}

// Service padrão: repassa ao repository e traduz ausência em 404. Módulos com regras próprias sobrescrevem métodos.
function createService({ repository, notFound, overrides = {} }) {
  return {
    list: (userId, filters) => repository.list(userId, filters),
    async find(userId, id) { return ensureFound(await repository.find(userId, id), notFound); },
    create: (userId, data) => repository.create(userId, data),
    async update(userId, id, data) { return ensureFound(await repository.update(userId, id, data), notFound); },
    async remove(userId, id) { ensureFound(await repository.remove(userId, id), notFound); },
    ...overrides,
  };
}

function createCrudController({ dto, service }) {
  return {
    async list(req, res) { res.json(await service.list(req.user.id, dto.filters(req.query))); },
    async find(req, res) { res.json(await service.find(req.user.id, uuid(req.params.id))); },
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
}

function createCrudRouter(controller) {
  const router = express.Router();
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.find);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  return router;
}

module.exports = { ensureFound, createService, createCrudController, createCrudRouter };
