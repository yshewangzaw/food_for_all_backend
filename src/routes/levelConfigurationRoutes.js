const express = require("express");
const router = express.Router();
const levelConfigurationController = require("../controllers/levelConfigurationController");

router.get("/", levelConfigurationController.getAll);
router.get("/:id", levelConfigurationController.getOne);
router.post("/", levelConfigurationController.create);
router.put("/:id", levelConfigurationController.update);
router.delete("/:id", levelConfigurationController.delete);

module.exports = router;