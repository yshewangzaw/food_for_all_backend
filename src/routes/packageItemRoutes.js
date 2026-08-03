const express = require("express");
const router = express.Router();
const packageItemController = require("../controllers/packageItemController");

router.get("/", packageItemController.getAll);
router.get("/:id", packageItemController.getOne);
router.post("/", packageItemController.create);
router.put("/:id", packageItemController.update);
router.delete("/:id", packageItemController.delete);

module.exports = router;