const express = require("express");
const router = express.Router();
const commissionController = require("../controllers/commissionController");

router.get("/", commissionController.getAll);
router.get("/user/:userId", commissionController.getByUserId);
router.get("/:id", commissionController.getOne);
router.post("/", commissionController.create);
router.put("/:id", commissionController.update);
router.delete("/:id", commissionController.delete);

module.exports = router;