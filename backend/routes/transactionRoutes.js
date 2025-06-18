const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT

// GET all transactions for a user
router.get("/", verifyToken, async (req, res) => {
  // console.log("📥 GET /api/transactions hit by user:", req.userId);
  const transactions = await Transaction.find({ userId: req.userId }).sort({
    date: -1,
  });
  res.json(transactions);
});

// POST add a new transaction
router.post("/", verifyToken, async (req, res) => {
  const newTransaction = new Transaction({ ...req.body, userId: req.userId });
  const saved = await newTransaction.save();
  res.status(201).json(saved);
});

// DELETE a transaction
router.delete("/:id", verifyToken, async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Transaction deleted" });
});

module.exports = router;
