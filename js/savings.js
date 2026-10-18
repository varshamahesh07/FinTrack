/**
 * FinTrack - Personal Financial Management System
 * Savings Goals Tracker & Progress Calculator (js/savings.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var goalsContainer = document.getElementById('savings-goals-grid');
  var newGoalForm = document.getElementById('add-goal-form');

  // Render savings goals cards
  function renderSavingsGoals() {
    var data = window.FinData.get();
    var goals = data.savingsGoals || [];

    // Calculate totals for summary metrics
    var totalTarget = 0;
    var totalSaved = 0;
    var completedCount = 0;

    goals.forEach(function (g) {
      totalTarget += Number(g.targetAmount) || 0;
      totalSaved += Number(g.currentSaved) || 0;
      if (Number(g.currentSaved) >= Number(g.targetAmount)) {
        completedCount++;
      }
    });

    var overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    // Update overall metric boxes if present
    var totalSavedElem = document.getElementById('savings-total-saved');
    var totalTargetElem = document.getElementById('savings-total-target');
    var completedCountElem = document.getElementById('savings-completed-count');
    var overallPercentElem = document.getElementById('savings-overall-percent');

    if (totalSavedElem) totalSavedElem.textContent = window.FinApp.formatCurrency(totalSaved);
    if (totalTargetElem) totalTargetElem.textContent = window.FinApp.formatCurrency(totalTarget);
    if (completedCountElem) completedCountElem.textContent = completedCount + ' / ' + goals.length + ' Goals';
    if (overallPercentElem) overallPercentElem.textContent = overallPercent + '%';

    if (!goalsContainer) return;

    if (goals.length === 0) {
      goalsContainer.innerHTML = '<div class="card text-center py-5" style="grid-column: 1 / -1;">' +
        '<p class="text-muted">No savings goals defined yet. Create your first goal using the form on the right!</p>' +
      '</div>';
      return;
    }

    var html = '';
    goals.forEach(function (g) {
      var target = Number(g.targetAmount) || 1;
      var saved = Number(g.currentSaved) || 0;
      var percent = Math.min(100, Math.round((saved / target) * 100));
      var isCompleted = saved >= target;

      var progressClass = isCompleted ? 'success' : (percent >= 50 ? 'warning' : 'danger');

      html += '<div class="card savings-goal-card ' + (isCompleted ? 'goal-completed-border' : '') + '">' +
        '<div class="card-header">' +
          '<div>' +
            '<h3 class="mb-1">' + g.name + '</h3>' +
            '<span class="text-muted" style="font-size: 0.8rem;">Deadline: ' + window.FinApp.formatDate(g.deadline) + '</span>' +
          '</div>' +
          '<div>' +
            (isCompleted
              ? '<span class="badge badge-success">Target Reached 🎉</span>'
              : '<span class="badge badge-info">' + percent + '% Done</span>') +
          '</div>' +
        '</div>' +

        '<div class="mb-2">' +
          '<div class="d-flex justify-between align-center mb-1">' +
            '<span class="text-muted" style="font-size: 0.85rem;">Saved: <strong>' + window.FinApp.formatCurrency(saved) + '</strong></span>' +
            '<span class="text-muted" style="font-size: 0.85rem;">Goal: <strong>' + window.FinApp.formatCurrency(target) + '</strong></span>' +
          '</div>' +
          '<div class="progress-bar-container">' +
            '<div class="progress-bar-fill ' + progressClass + '" style="width: ' + percent + '%;"></div>' +
          '</div>' +
        '</div>' +

        (g.note ? '<p class="text-muted mb-3" style="font-size: 0.85rem; font-style: italic;">"' + g.note + '"</p>' : '') +

        // Appreciation Banner when Target Reached
        (isCompleted
          ? '<div class="alert alert-success py-2 mb-3" style="font-size: 0.85rem;">' +
              '🌟 <strong>Congratulations!</strong> You have achieved 100% of your target savings for this goal! Outstanding discipline.' +
            '</div>'
          : '') +

        '<div class="d-flex justify-between align-center gap-1 mt-2">' +
          '<div class="d-flex gap-1">' +
            '<button class="btn btn-sm btn-secondary btn-deposit-quick" data-id="' + g.id + '" data-amount="50">+ ₹50</button>' +
            '<button class="btn btn-sm btn-secondary btn-deposit-quick" data-id="' + g.id + '" data-amount="100">+ ₹100</button>' +
          '</div>' +
          '<button class="btn btn-sm btn-outline text-danger btn-delete-goal" data-id="' + g.id + '" title="Delete Goal">Delete</button>' +
        '</div>' +
      '</div>';
    });

    goalsContainer.innerHTML = html;
    bindGoalActions();
  }

  // Bind Quick Deposit and Delete actions
  function bindGoalActions() {
    var depositBtns = document.querySelectorAll('.btn-deposit-quick');
    depositBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var addAmount = parseFloat(this.getAttribute('data-amount')) || 50;
        depositFunds(id, addAmount);
      });
    });

    var deleteBtns = document.querySelectorAll('.btn-delete-goal');
    deleteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteGoal(id);
      });
    });
  }

  // Add deposit to a savings goal
  function depositFunds(id, amount) {
    var data = window.FinData.get();
    var goal = (data.savingsGoals || []).find(function (g) {
      return g.id === id;
    });

    if (goal) {
      var prevSaved = Number(goal.currentSaved) || 0;
      var newSaved = prevSaved + amount;
      goal.currentSaved = newSaved;
      window.FinData.save(data);

      if (newSaved >= goal.targetAmount && prevSaved < goal.targetAmount) {
        window.FinApp.showToast('🎉 Congratulations! You reached your goal: ' + goal.name + '!', 'success');
      } else {
        window.FinApp.showToast('Deposited ' + window.FinApp.formatCurrency(amount) + ' into ' + goal.name + '!', 'success');
      }

      renderSavingsGoals();
    }
  }

  // Delete goal
  function deleteGoal(id) {
    if (!confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }

    var data = window.FinData.get();
    data.savingsGoals = (data.savingsGoals || []).filter(function (g) {
      return g.id !== id;
    });

    window.FinData.save(data);
    window.FinApp.showToast('Savings goal removed.');
    renderSavingsGoals();
  }

  // Handle Add New Goal Form submit
  if (newGoalForm) {
    newGoalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('goal-name');
      var targetInput = document.getElementById('goal-target');
      var currentInput = document.getElementById('goal-current');
      var deadlineInput = document.getElementById('goal-deadline');
      var noteInput = document.getElementById('goal-note');

      var name = nameInput.value.trim();
      var target = parseFloat(targetInput.value);
      var current = parseFloat(currentInput.value) || 0;
      var deadline = deadlineInput.value;
      var note = noteInput.value.trim();

      if (!name) {
        window.FinApp.showToast('Please enter a goal name.', 'warning');
        nameInput.focus();
        return;
      }

      if (isNaN(target) || target <= 0) {
        window.FinApp.showToast('Please enter a target amount greater than 0.', 'warning');
        targetInput.focus();
        return;
      }

      if (!deadline) {
        window.FinApp.showToast('Please select a target deadline date.', 'warning');
        deadlineInput.focus();
        return;
      }

      var newGoal = {
        id: 'sav-' + Date.now(),
        name: name,
        targetAmount: target,
        currentSaved: current,
        deadline: deadline,
        note: note
      };

      var data = window.FinData.get();
      if (!data.savingsGoals) data.savingsGoals = [];
      data.savingsGoals.push(newGoal);
      window.FinData.save(data);

      window.FinApp.showToast('New savings goal created!', 'success');
      newGoalForm.reset();
      renderSavingsGoals();
    });
  }

  // Set default deadline to 3 months from now
  var deadlineField = document.getElementById('goal-deadline');
  if (deadlineField && !deadlineField.value) {
    var futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    deadlineField.value = futureDate.toISOString().split('T')[0];
  }

  // Initial render
  renderSavingsGoals();

});
