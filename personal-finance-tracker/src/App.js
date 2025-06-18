import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BalanceCard from "./components/BalanceCard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import ExpenseChart from "./components/ExpenseChart";
import { Wallet, Sun, Moon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./utils/formatters";

function App() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chat-app-login-user-data");
    return stored ? JSON.parse(stored) : null;
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonthYear, setSelectedMonthYear] = useState(""); // Input value
  const [filteredMonthTransactions, setFilteredMonthTransactions] =
    useState(null); // Result

  const token = localStorage.getItem("token");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    setSelectedMonthYear(`${year}-${month}`);
  }, []);

  // Apply theme class to root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        if (err.response?.status === 401) navigate("/login");
      }
    };

    fetchTransactions();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("chat-app-login-user-data"); // ✅ Clear user data
    navigate("/login");
  };

  // Make sure this is correct path

  const exportToPDF = (transactions, startDate, endDate) => {
    if (!Array.isArray(transactions)) {
      console.error("Invalid transactions data");
      return;
    }

    const formatDateIndian = (dateStr) => {
      const date = new Date(dateStr);
      return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;
    };

    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date);
      const txDateStr = `${txDate.getFullYear()}-${String(
        txDate.getMonth() + 1
      ).padStart(2, "0")}-${String(txDate.getDate()).padStart(2, "0")}`;

      return (
        (!startDate || txDateStr >= startDate) &&
        (!endDate || txDateStr <= endDate)
      );
    });

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Transaction History", 14, 22);

    // Main Table
    autoTable(doc, {
      startY: 30,
      head: [["Date", "Type", "Amount (Rs)", "Description"]],
      body: filtered.map((t) => [
        formatDateIndian(t.date),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `Rs ${t.amount}`,
        t.description || "-",
      ]),
    });

    // Summary - based on filtered data
    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const summaryStartY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Summary", 14, summaryStartY);

    autoTable(doc, {
      startY: summaryStartY + 5,
      head: [["Total Income (Rs)", "Total Expenses (Rs)", "Balance (Rs)"]],
      body: [[`Rs ${totalIncome}`, `Rs ${totalExpenses}`, `Rs ${balance}`]],
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    const dateStr = formatDateIndian(new Date());
    doc.setFontSize(10);
    doc.text(`Exported on ${dateStr} using Personal Finance Tracker`, 14, 285);

    // File name reflects date range
    const fileStart = startDate || "start";
    const fileEnd = endDate || "end";
    doc.save(`transactions_${fileStart}_to_${fileEnd}.pdf`);
  };

  const addTransaction = async (transaction) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions",
        transaction,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTransactions([...transactions, res.data]);
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from all transactions
      const updatedTransactions = transactions.filter((t) => t._id !== id);
      setTransactions(updatedTransactions);

      // Also update the filtered transactions if in use
      if (filteredMonthTransactions) {
        setFilteredMonthTransactions(
          filteredMonthTransactions.filter((t) => t._id !== id)
        );
      }
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Improved Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          {/* Top Row - Logo and User Info */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Personal Finance Tracker
                </h1>
                {user && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Welcome back, {user.name}
                  </p>
                )}
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg transition-colors duration-200"
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Control Bar */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Month Filter Section */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Filter by Month:
                </label>
                <input
                  type="month"
                  value={selectedMonthYear}
                  onChange={(e) => setSelectedMonthYear(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (!selectedMonthYear) return;

                    const [year, month] = selectedMonthYear.split("-");
                    const filtered = sortedTransactions.filter((t) => {
                      const txDate = new Date(t.date);
                      return (
                        txDate.getFullYear() === Number(year) &&
                        txDate.getMonth() + 1 === Number(month)
                      );
                    });

                    setFilteredMonthTransactions(filtered);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Apply
                </button>
              </div>

              {/* Date Range Section */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Date Range:
                </label>
                <input
                  type="date"
                  aria-label="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="date"
                  aria-label="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Export Section */}
              <div className="ml-auto">
                <button
                  onClick={() => exportToPDF(transactions, startDate, endDate)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
                >
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-lg">
          Take control of your finances with easy expense tracking
        </p>

        <BalanceCard
          balance={balance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        <TransactionForm onAddTransaction={addTransaction} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TransactionList
              transactions={filteredMonthTransactions || sortedTransactions}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
          <div>
            <ExpenseChart
              transactions={filteredMonthTransactions || transactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
