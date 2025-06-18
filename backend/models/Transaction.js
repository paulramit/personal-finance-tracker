const mongoose = require("mongoose"); // ✅ Add this line

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: String,
  description: String, // ✅ Add this line
  date: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

module.exports = mongoose.model("Transaction", transactionSchema);
