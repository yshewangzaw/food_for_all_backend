const express = require("express");
const router = express.Router();
const withdrawalRequestController = require("../controllers/withdrawalRequestController");

router.get("/", withdrawalRequestController.getAll);
router.get("/user/:userId", withdrawalRequestController.getByUserId);
router.get("/:id", withdrawalRequestController.getOne);
router.post("/", withdrawalRequestController.create);
router.put("/:id", withdrawalRequestController.update);
router.delete("/:id", withdrawalRequestController.delete);

module.exports = router;