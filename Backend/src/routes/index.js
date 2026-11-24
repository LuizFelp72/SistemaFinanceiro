const router = require("express").Router();
const pool = require("../configs/database");
const authenticate = require("../middlewares/auth.middleware");

// Para adicionar uma entidade, crie o módulo em src/modules/<nome>/index.js exportando { path, router } e liste-o aqui.
const modules = [
  require("../modules/auth"),
  require("../modules/accounts"),
  require("../modules/transactions"),
  require("../modules/payment-methods"),
  require("../modules/categories"),
  require("../modules/assets"),
  require("../modules/goals"),
];

router.get("/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

for (const { path, router: moduleRouter, public: isPublic } of modules) {
  if (isPublic) router.use(path, moduleRouter);
  else router.use(path, authenticate, moduleRouter);
}

module.exports = router;
