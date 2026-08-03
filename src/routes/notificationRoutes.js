const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getAll);
router.get("/user/:userId", notificationController.getByUserId);
router.get("/:id", notificationController.getOne);
router.post("/", notificationController.create);
router.put("/:id", notificationController.update);
router.delete("/:id", notificationController.delete);

module.exports = router;