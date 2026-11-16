const repository = require("./asset.repository");
const { AppError } = require("../../shared/errors");

function verificarEncontrado(asset) {
  if (!asset) {
    throw new AppError(404, "Bem não encontrado.");
  }
  return asset;
}

async function list(userId, filters) {
  return repository.list(userId, filters);
}

async function find(userId, id) {
  const asset = await repository.find(userId, id);
  return verificarEncontrado(asset);
}

async function create(userId, data) {
  return repository.create(userId, data);
}

async function update(userId, id, data) {
  const assetAtualizado = await repository.update(userId, id, data);
  return verificarEncontrado(assetAtualizado);
}

async function remove(userId, id) {
  const assetRemovido = await repository.remove(userId, id);
  return verificarEncontrado(assetRemovido);
}

module.exports = { list, find, create, update, remove };
