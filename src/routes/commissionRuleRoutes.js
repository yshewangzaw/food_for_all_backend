const express = require("express");
const router = express.Router();
const commissionRuleController = require("../controllers/commissionRuleController");

router.get("/", commissionRuleController.getAll);
router.get("/:id", commissionRuleController.getOne);
router.post("/", commissionRuleController.create);
router.put("/:id", commissionRuleController.update);
router.delete("/:id", commissionRuleController.delete);

module.exports = router;