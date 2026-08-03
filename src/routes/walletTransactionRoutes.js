const express = require("express");
const router = express.Router();
const walletTransactionController = require("../controllers/walletTransactionController");

// Verify that all functions are correctly attached
router.get("/", walletTransactionController.getAll);
router.get("/user/:userId", walletTransactionController.getByUserId);
router.get("/:id", walletTransactionController.getOne); 
router.post("/", walletTransactionController.create);

module.exports = router;