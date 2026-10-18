/**
 * FinTrack - Personal Financial Management System
 * Dashboard Logic & Chart Visualization (js/dashboard.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var data = window.FinData.get();
  var summary = window.FinData.getSummary();

  // 1. Populate Metric Cards
  function renderMetrics() {
    var elemIncome = document.getElementById('metric-total-income');
    var elemPlanned = document.getElementById('metric-planned-expenses');
    var elemActual = document.getElementById('metric-actual-expenses');
    var elemRemaining = document.getElementById('metric-remaining-budget');
    var elemSavings = document.getElementById('metric-total-savings');
    var elemSavingsTarget = document.getElementById('metric-savings-target');

    if (elemIncome) elemIncome.textContent = window.FinApp.formatCurrency(summary.monthlyIncome);
    if (elemPlanned) elemPlanned.textContent = window.FinApp.formatCurrency(summary.plannedExpenses);
    if (elemActual) elemActual.textContent = window.FinApp.formatCurrency(summary.actualExpenses);
    if (elemRemaining) {
      elemRemaining.textContent = window.FinApp.formatCurrency(summary.remainingBudget);
      elemRemaining.className = 'metric-value ' + (summary.remainingBudget < 0 ? 'text-danger' : 'text-success');
    }
    if (elemSavings) elemSavings.textContent = window.FinApp.formatCurrency(summary.totalSavings);
    if (elemSavingsTarget) elemSavingsTarget.textContent = window.FinApp.formatCurrency(summary.savingsTarget);

    // Render budget status banner
    var budgetStatusBox = document.getElementById('dashboard-budget-status');
    if (budgetStatusBox) {
      var status = summary.budgetStatus;
      var alertClass = status.type === 'danger' ? 'alert-danger' : (status.type === 'warning' ? 'alert-warning' : 'alert-success');
      
      var message = '<strong>Budget Status: ' + status.label + '</strong> — You have spent ' +
                    window.FinApp.formatCurrency(summary.actualExpenses) + ' (' + status.percent + '%) of your planned ' +
                    window.FinApp.formatCurrency(summary.plannedExpenses) + ' monthly budget.';

      budgetStatusBox.className = 'alert ' + alertClass;
      budgetStatusBox.innerHTML = message;
    }
  }

  // 2. Populate Recent Expenses Table
  function renderRecentExpenses() {
    var tbody = document.getElementById('recent-expenses-tbody');
    if (!tbody) return;

    var sortedExpenses = (data.expenses || []).slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    }).slice(0, 5); // Take latest 5

    if (sortedExpenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No expenses recorded yet.</td></tr>';
      return;
    }

    var html = '';
    sortedExpenses.forEach(function (item) {
      html += '<tr>' +
        '<td><strong>' + window.FinApp.formatDate(item.date) + '</strong></td>' +
        '<td><span class="badge badge-info">' + item.category + '</span></td>' +
        '<td>' + item.description + '</td>' +
        '<td class="text-right fw-bold text-danger">-' + window.FinApp.formatCurrency(item.amount) + '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  // 3. Populate Upcoming Bills Widget
  function renderUpcomingBills() {
    var container = document.getElementById('upcoming-bills-list');
    if (!container) return;

    var pendingBills = (data.bills || []).filter(function (b) {
      return b.status !== 'Paid';
    }).slice(0, 4);

    if (pendingBills.length === 0) {
      container.innerHTML = '<p class="text-muted text-center py-3">All scheduled bills are currently paid!</p>';
      return;
    }

    var html = '';
    pendingBills.forEach(function (bill) {
      html += '<div class="activity-item">' +
        '<div class="activity-info">' +
          '<div class="activity-icon">📅</div>' +
          '<div>' +
            '<div class="activity-title">' + bill.name + '</div>' +
            '<div class="activity-subtitle">Due ' + window.FinApp.formatDate(bill.dueDate) + ' • ' + bill.frequency + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="text-right">' +
          '<div class="activity-amount">' + window.FinApp.formatCurrency(bill.amount) + '</div>' +
          '<span class="badge badge-warning">Due Soon</span>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  }

  // 4. Populate Financial Alerts Card
  function renderFinancialAlerts() {
    var alertContainer = document.getElementById('financial-alerts-list');
    if (!alertContainer) return;

    var alerts = [];

    // Check savings goal achievement
    (data.savingsGoals || []).forEach(function (g) {
      if (g.currentSaved >= g.targetAmount) {
        alerts.push({
          type: 'success',
          icon: '🎉',
          text: 'Milestone reached: Your goal <strong>' + g.name + '</strong> is 100% funded!'
        });
      }
    });

    // Check bill due dates
    (data.bills || []).forEach(function (b) {
      if (b.status === 'Pending') {
        alerts.push({
          type: 'warning',
          icon: '⚠️',
          text: 'Upcoming payment: <strong>' + b.name + '</strong> (' + window.FinApp.formatCurrency(b.amount) + ') is due on ' + window.FinApp.formatDate(b.dueDate) + '.'
        });
      }
    });

    if (alerts.length === 0) {
      alertContainer.innerHTML = '<div class="text-muted text-center py-2">No active warnings or alerts.</div>';
      return;
    }

    var html = '';
    alerts.slice(0, 3).forEach(function (a) {
      html += '<div class="alert alert-' + a.type + ' mb-2" style="padding: 0.75rem 1rem; font-size: 0.875rem;">' +
        '<span>' + a.icon + '</span>' +
        '<div>' + a.text + '</div>' +
      '</div>';
    });

    alertContainer.innerHTML = html;
  }

  // 5. Initialize Monthly Expense Chart via Chart.js
  function renderMonthlyExpenseChart() {
    var canvas = document.getElementById('monthlyExpenseChart');
    if (!canvas || typeof Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');

    // Months comparison data (last 4 months demo trend)
    var labels = ['June', 'July', 'August', 'September (Current)'];
    var plannedData = [3500, 3700, 3700, summary.plannedExpenses];
    var actualData = [3200, 3950, 3400, summary.actualExpenses];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Planned Budget (₹)',
            data: plannedData,
            backgroundColor: 'rgba(59, 130, 246, 0.65)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Actual Expenses (₹)',
            data: actualData,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif', size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ' ' + context.dataset.label + ': ₹' + Number(context.raw).toLocaleString('en-IN');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (val) {
                return '₹' + val.toLocaleString('en-IN');
              }
            },
            grid: {
              color: '#f1f5f9'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Execute initial rendering
  renderMetrics();
  renderRecentExpenses();
  renderUpcomingBills();
  renderFinancialAlerts();
  renderMonthlyExpenseChart();

});
