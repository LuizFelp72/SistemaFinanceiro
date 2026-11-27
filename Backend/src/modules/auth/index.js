const router = require("express").Router();
const authenticate = require("../../middlewares/auth.middleware");
const dto = require("./auth.dto");
const service = require("./auth.service");

router.post("/register", async (req, res) => {
  const result = await service.register(dto.register(req.body));
  res.status(201).json(result);
});
router.post("/login", async (req, res) => res.json(await service.login(dto.login(req.body))));
router.get("/me", authenticate, async (req, res) => res.json(await service.me(req.user.id)));

router.patch("/me", authenticate, async (req,res) => res.json(await service.updateProfile(req.user.id,dto.profile(req.body))));
router.post("/password", authenticate, async (req,res) => res.json(await service.changePassword(req.user.id,dto.password(req.body))));

// Público: as rotas de cadastro e login não exigem token.
module.exports = { path: "/auth", public: true, router };
