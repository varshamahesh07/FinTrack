/**
 * FinTrack - Personal Financial Management System
 * Reports & Visual Analytics (js/reports.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var data = window.FinData.get();
  var summary = window.FinData.getSummary();

  // 1. Populate KPI Summary Cards
  function renderReportKPIs() {
    var elemIncome = document.getElementById('report-monthly-income');
    var elemExpenses = document.getElementById('report-monthly-expenses');
    var elemSavings = document.getElementById('report-total-savings');
    var elemRemaining = document.getElementById('report-remaining-budget');
    var elemSavingsRate = document.getElementById('report-savings-rate');

    if (elemIncome) elemIncome.textContent = window.FinApp.formatCurrency(summary.monthlyIncome);
    if (elemExpenses) elemExpenses.textContent = window.FinApp.formatCurrency(summary.actualExpenses);
    if (elemSavings) elemSavings.textContent = window.FinApp.formatCurrency(summary.totalSavings);
    
    if (elemRemaining) {
      elemRemaining.textContent = window.FinApp.formatCurrency(summary.remainingBudget);
      elemRemaining.className = 'metric-value ' + (summary.remainingBudget < 0 ? 'text-danger' : 'text-success');
    }

    // Calculate Savings Rate (%) = (Savings / Income) * 100
    if (elemSavingsRate) {
      var rate = summary.monthlyIncome > 0 ? Math.round((summary.totalSavings / summary.monthlyIncome) * 100) : 0;
      elemSavingsRate.textContent = rate + '%';
    }
  }

  // 2. Render Category-wise Expense Chart (Doughnut)
  function renderCategoryChart() {
    var canvas = document.getElementById('categoryExpenseChart');
    if (!canvas || typeof Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');

    // Group actual expenses by category
    var categoryTotals = {};
    (data.expenses || []).forEach(function (e) {
      var cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });

    var labels = Object.keys(categoryTotals);
    var amounts = Object.values(categoryTotals);

    // Fallback if no expenses recorded
    if (labels.length === 0) {
      labels = ['No Expenses'];
      amounts = [1];
    }

    var colors = [
      '#10b981', // Emerald
      '#3b82f6', // Blue
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#64748b'  // Slate
    ];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { size: 12, family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                var val = context.raw;
                return ' ' + context.label + ': ₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 });
              }
            }
          }
        },
        cutout: '65%'
      }
    });

    // Populate Category Breakdown List
    var breakdownContainer = document.getElementById('category-breakdown-list');
    if (breakdownContainer && labels.length > 0) {
      var html = '';
      var total = amounts.reduce(function (a, b) { return a + b; }, 0);
      labels.forEach(function (label, idx) {
        var amt = amounts[idx];
        var pct = total > 0 ? Math.round((amt / total) * 100) : 0;
        var color = colors[idx % colors.length];

        html += '<div class="d-flex justify-between align-center py-2" style="border-bottom: 1px solid #f1f5f9;">' +
          '<div class="d-flex align-center gap-2">' +
            '<span style="width: 10px; height: 10px; border-radius: 50%; background-color: ' + color + ';"></span>' +
            '<span style="font-size: 0.9rem; font-weight: 500;">' + label + '</span>' +
          '</div>' +
          '<div class="text-right">' +
            '<span style="font-weight: 700; font-size: 0.9rem;">' + window.FinApp.formatCurrency(amt) + '</span> ' +
            '<span class="text-muted" style="font-size: 0.775rem;">(' + pct + '%)</span>' +
          '</div>' +
        '</div>';
      });
      breakdownContainer.innerHTML = html;
    }
  }

  // 3. Render Monthly Expense Chart (Bar Chart Comparison)
  function renderMonthlyComparisonChart() {
    var canvas = document.getElementById('monthlyComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');

    var months = ['May', 'Jun', 'Jul', 'Aug', 'Sep (Current)'];
    var incomes = [4800, 5000, 5000, 5000, summary.monthlyIncome];
    var expenses = [3100, 3400, 3650, 3350, summary.actualExpenses];
    var savingsAllocated = [1100, 1200, 1000, 1250, 1400];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomes,
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: expenses,
            backgroundColor: '#ef4444',
            borderRadius: 4
          },
          {
            label: 'Savings',
            data: savingsAllocated,
            backgroundColor: '#3b82f6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12 }
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
            grid: { display: false }
          }
        }
      }
    });
  }

  // Bind print report button
  var printBtn = document.getElementById('btn-print-report');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }

  // Initial runs
  renderReportKPIs();
  renderCategoryChart();
  renderMonthlyComparisonChart();

});
