import React, { useState } from "react";

import { formatCurrency, formatDate } from "../utils/formatters";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";

const TransactionList = ({ transactions, onDeleteTransaction }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <p className="text-gray-500 text-center py-8">
          No transactions yet. Add your first transaction above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Transactions
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {transaction.type === "income" ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {transaction.description}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>

              <button
                onClick={() => onDeleteTransaction(transaction._id)}
                className="p-1 text-gray-400 hover:text-red-600 transition duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
