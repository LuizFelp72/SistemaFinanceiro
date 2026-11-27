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

const recoveryAttempts = new Map();
function limitRecovery(req,res,next) {
  const now=Date.now();
  for (const [key,entry] of recoveryAttempts) if(entry.until<now) recoveryAttempts.delete(key);
  const key=req.ip;
  const entry=recoveryAttempts.get(key)||{count:0,until:now+15*60*1000};
  if(entry.count>=5) return res.status(429).json({error:"Aguarde alguns minutos antes de tentar novamente."});
  entry.count++;recoveryAttempts.set(key,entry);next();
}
router.post("/forgot-password",limitRecovery,async(req,res)=>{
  await service.forgotPassword(dto.forgot(req.body));
  res.json({message:"Se o e-mail estiver cadastrado, você receberá as instruções."});
});
router.post("/reset-password",limitRecovery,async(req,res)=>{
  await service.resetPassword(dto.reset(req.body));res.status(204).end();
});
// Público: as rotas de cadastro e login não exigem token.
module.exports = { path: "/auth", public: true, router };
