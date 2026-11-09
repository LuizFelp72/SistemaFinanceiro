const router = require("express").Router();
const controller = require("./transaction.controller");

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.find);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
