/**
 * FinTrack - Personal Financial Management System
 * Central Client-Side Data Store (js/data.js)
 * 
 * Note: Uses browser localStorage exclusively for client-side demo persistence.
 * Strictly adheres to project rules: NO backend, NO database, NO AI runtime.
 */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'fintrack_demo_data_v2';

  // Realistic sample financial data suitable for a college student / young professional
  var defaultData = {
    user: {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      currency: '₹'
    },
    budget: {
      monthlyIncome: 5000,
      food: 700,
      travel: 350,
      education: 400,
      bills: 900,
      other: 450,
      savingsTarget: 1200
    },
    expenses: [
      {
        id: 'exp-1',
        date: '2026-09-18',
        category: 'Food & Dining',
        amount: 58.50,
        paymentMethod: 'Debit Card',
        description: 'Weekly grocery shopping'
      },
      {
        id: 'exp-2',
        date: '2026-09-17',
        category: 'Transportation',
        amount: 32.00,
        paymentMethod: 'UPI / Bank Transfer',
        description: 'Monthly transit card reload'
      },
      {
        id: 'exp-3',
        date: '2026-09-16',
        category: 'Education',
        amount: 85.00,
        paymentMethod: 'Credit Card',
        description: 'Algorithm textbook & lab notes'
      },
      {
        id: 'exp-4',
        date: '2026-09-15',
        category: 'Bills & Utilities',
        amount: 110.00,
        paymentMethod: 'Credit Card',
        description: 'Water & Electricity bill'
      },
      {
        id: 'exp-5',
        date: '2026-09-14',
        category: 'Entertainment',
        amount: 42.00,
        paymentMethod: 'Cash',
        description: 'Cinema ticket & weekend dining'
      },
      {
        id: 'exp-6',
        date: '2026-09-12',
        category: 'Food & Dining',
        amount: 24.50,
        paymentMethod: 'UPI / Bank Transfer',
        description: 'Campus cafeteria meals'
      },
      {
        id: 'exp-7',
        date: '2026-09-10',
        category: 'Shopping',
        amount: 75.00,
        paymentMethod: 'Debit Card',
        description: 'College stationery & backpack'
      },
      {
        id: 'exp-8',
        date: '2026-09-08',
        category: 'Bills & Utilities',
        amount: 55.00,
        paymentMethod: 'Credit Card',
        description: 'High-speed broadband bill'
      }
    ],
    savingsGoals: [
      {
        id: 'sav-1',
        name: 'Emergency Fund',
        targetAmount: 2500,
        currentSaved: 2500,
        deadline: '2026-10-31',
        note: 'Covers 3 months of essential emergency expenses'
      },
      {
        id: 'sav-2',
        name: 'Coding Laptop Upgrade',
        targetAmount: 1400,
        currentSaved: 1050,
        deadline: '2026-11-20',
        note: 'MacBook Air or ThinkPad for capstone project'
      },
      {
        id: 'sav-3',
        name: 'Web Certification Exam',
        targetAmount: 300,
        currentSaved: 180,
        deadline: '2026-12-15',
        note: 'Professional Cloud & Frontend certification'
      },
      {
        id: 'sav-4',
        name: 'Winter Break Trip',
        targetAmount: 800,
        currentSaved: 400,
        deadline: '2027-01-05',
        note: 'Annual student tech conference trip'
      }
    ],
    bills: [
      {
        id: 'bill-1',
        name: 'House Rent',
        amount: 650.00,
        dueDate: '2026-09-25',
        frequency: 'Monthly',
        status: 'Pending'
      },
      {
        id: 'bill-2',
        name: 'Electricity',
        amount: 90.00,
        dueDate: '2026-09-22',
        frequency: 'Monthly',
        status: 'Pending'
      },
      {
        id: 'bill-3',
        name: 'Internet Broadband',
        amount: 55.00,
        dueDate: '2026-09-28',
        frequency: 'Monthly',
        status: 'Pending'
      },
      {
        id: 'bill-4',
        name: 'Student Laptop EMI',
        amount: 115.00,
        dueDate: '2026-09-30',
        frequency: 'Monthly',
        status: 'Pending'
      },
      {
        id: 'bill-5',
        name: 'Mobile Network Plan',
        amount: 30.00,
        dueDate: '2026-09-12',
        frequency: 'Monthly',
        status: 'Paid'
      }
    ]
  };

  var FinData = {
    // Retrieve complete state from localStorage (or populate default)
    get: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.reset();
          return JSON.parse(JSON.stringify(defaultData));
        }
        return JSON.parse(raw);
      } catch (e) {
        console.warn('localStorage error, using defaults', e);
        return JSON.parse(JSON.stringify(defaultData));
      }
    },

    // Save modified state
    save: function (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Could not save to localStorage', e);
      }
    },

    // Reset data back to default demo state
    reset: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      } catch (e) {
        console.error('Reset failed', e);
      }
    },

    // Compute key summary figures required across Dashboard and Reports
    getSummary: function () {
      var data = this.get();
      var b = data.budget || {};
      var monthlyIncome = Number(b.monthlyIncome) || 0;

      // Planned expenses is the sum of budgeted category allocations
      var plannedExpenses = (Number(b.food) || 0) +
                            (Number(b.travel) || 0) +
                            (Number(b.education) || 0) +
                            (Number(b.bills) || 0) +
                            (Number(b.other) || 0);

      // Actual expenses sum from recorded transactions
      var actualExpenses = (data.expenses || []).reduce(function (sum, item) {
        return sum + (Number(item.amount) || 0);
      }, 0);

      var remainingBudget = monthlyIncome - actualExpenses;

      // Savings calculations
      var totalSavings = (data.savingsGoals || []).reduce(function (sum, g) {
        return sum + (Number(g.currentSaved) || 0);
      }, 0);

      var savingsTarget = (data.savingsGoals || []).reduce(function (sum, g) {
        return sum + (Number(g.targetAmount) || 0);
      }, 0);

      // Dynamic Budget Status determination
      var percentUsed = plannedExpenses > 0 ? (actualExpenses / plannedExpenses) * 100 : 0;
      var budgetStatus = {
        label: 'Healthy & On Track',
        type: 'success',
        percent: Math.round(percentUsed)
      };

      if (actualExpenses > plannedExpenses) {
        budgetStatus = {
          label: 'Over Budget!',
          type: 'danger',
          percent: Math.round(percentUsed)
        };
      } else if (percentUsed >= 80) {
        budgetStatus = {
          label: 'Approaching Limit',
          type: 'warning',
          percent: Math.round(percentUsed)
        };
      }

      return {
        currency: (data.user && data.user.currency) || '₹',
        monthlyIncome: monthlyIncome,
        plannedExpenses: plannedExpenses,
        actualExpenses: actualExpenses,
        remainingBudget: remainingBudget,
        totalSavings: totalSavings,
        savingsTarget: savingsTarget,
        budgetStatus: budgetStatus,
        expenseCount: (data.expenses || []).length,
        pendingBillsCount: (data.bills || []).filter(function (bill) {
          return bill.status !== 'Paid';
        }).length
      };
    }
  };

  // Expose globally to window
  window.FinData = FinData;

})(window);
