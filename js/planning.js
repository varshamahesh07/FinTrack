/**
 * FinTrack - Personal Financial Management System
 * Financial Planning & Budget Allocation Logic (js/planning.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var form = document.getElementById('budget-planning-form');
  var inputIncome = document.getElementById('budget-income');
  var inputFood = document.getElementById('budget-food');
  var inputTravel = document.getElementById('budget-travel');
  var inputEducation = document.getElementById('budget-education');
  var inputBills = document.getElementById('budget-bills');
  var inputOther = document.getElementById('budget-other');
  var inputSavings = document.getElementById('budget-savings');

  // Summary elements
  var statIncome = document.getElementById('stat-planned-income');
  var statExpenses = document.getElementById('stat-total-planned-expenses');
  var statSavings = document.getElementById('stat-savings-allocation');
  var statRemaining = document.getElementById('stat-unallocated-remaining');
  var statusMessage = document.getElementById('planning-status-message');

  // Load existing budget values into form
  function loadFormValues() {
    var data = window.FinData.get();
    var b = data.budget || {};

    if (inputIncome) inputIncome.value = b.monthlyIncome || 0;
    if (inputFood) inputFood.value = b.food || 0;
    if (inputTravel) inputTravel.value = b.travel || 0;
    if (inputEducation) inputEducation.value = b.education || 0;
    if (inputBills) inputBills.value = b.bills || 0;
    if (inputOther) inputOther.value = b.other || 0;
    if (inputSavings) inputSavings.value = b.savingsTarget || 0;

    calculateBudget();
  }

  // Real-time calculation of totals and remaining balances
  function calculateBudget() {
    var income = parseFloat(inputIncome.value) || 0;
    var food = parseFloat(inputFood.value) || 0;
    var travel = parseFloat(inputTravel.value) || 0;
    var education = parseFloat(inputEducation.value) || 0;
    var bills = parseFloat(inputBills.value) || 0;
    var other = parseFloat(inputOther.value) || 0;
    var savings = parseFloat(inputSavings.value) || 0;

    var totalPlannedExpenses = food + travel + education + bills + other;
    var totalAllocated = totalPlannedExpenses + savings;
    var unallocatedRemaining = income - totalAllocated;

    // Update displays
    if (statIncome) statIncome.textContent = window.FinApp.formatCurrency(income);
    if (statExpenses) statExpenses.textContent = window.FinApp.formatCurrency(totalPlannedExpenses);
    if (statSavings) statSavings.textContent = window.FinApp.formatCurrency(savings);

    if (statRemaining) {
      statRemaining.textContent = window.FinApp.formatCurrency(unallocatedRemaining);
      if (unallocatedRemaining < 0) {
        statRemaining.className = 'metric-value text-danger';
      } else if (unallocatedRemaining === 0) {
        statRemaining.className = 'metric-value text-primary';
      } else {
        statRemaining.className = 'metric-value text-success';
      }
    }

    // Feedback message
    if (statusMessage) {
      if (unallocatedRemaining < 0) {
        statusMessage.className = 'alert alert-danger';
        statusMessage.innerHTML = '<strong>Warning: Over-allocated!</strong> Your total planned expenses and savings exceed your monthly income by ' +
          window.FinApp.formatCurrency(Math.abs(unallocatedRemaining)) + '. Consider reducing non-essential categories.';
      } else if (unallocatedRemaining === 0) {
        statusMessage.className = 'alert alert-success';
        statusMessage.innerHTML = '<strong>Zero-Based Budget Achieved!</strong> Every rupee of your income has been planned towards expenses or savings.';
      } else {
        statusMessage.className = 'alert alert-info';
        statusMessage.innerHTML = '<strong>Buffer Remaining:</strong> You have ' + window.FinApp.formatCurrency(unallocatedRemaining) +
          ' unallocated income left over for contingencies or higher savings.';
      }
    }
  }

  // Listen to input events for instant reactive math
  var inputs = [inputIncome, inputFood, inputTravel, inputEducation, inputBills, inputOther, inputSavings];
  inputs.forEach(function (inp) {
    if (inp) {
      inp.addEventListener('input', calculateBudget);
    }
  });

  // Handle save
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var income = parseFloat(inputIncome.value) || 0;
      if (income <= 0) {
        window.FinApp.showToast('Please enter a valid monthly income greater than 0', 'warning');
        return;
      }

      var data = window.FinData.get();
      data.budget = {
        monthlyIncome: income,
        food: parseFloat(inputFood.value) || 0,
        travel: parseFloat(inputTravel.value) || 0,
        education: parseFloat(inputEducation.value) || 0,
        bills: parseFloat(inputBills.value) || 0,
        other: parseFloat(inputOther.value) || 0,
        savingsTarget: parseFloat(inputSavings.value) || 0
      };

      window.FinData.save(data);
      window.FinApp.showToast('Financial plan updated successfully!', 'success');
      calculateBudget();
    });
  }

  // Reset button
  var resetBtn = document.getElementById('btn-reset-planning');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset budget inputs back to saved values?')) {
        loadFormValues();
        window.FinApp.showToast('Inputs restored to stored values.');
      }
    });
  }

  // Initial load
  loadFormValues();

});
