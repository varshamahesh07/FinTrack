/**
 * FinTrack - Personal Financial Management System
 * Daily Expense Management & Table Operations (js/expenses.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var expenseForm = document.getElementById('expense-form');
  var expenseTableBody = document.getElementById('expenses-table-body');
  var searchInput = document.getElementById('expense-search');
  var categoryFilter = document.getElementById('expense-filter-category');

  var currentEditId = null;

  // Render expenses in table
  function renderExpensesTable() {
    var data = window.FinData.get();
    var list = data.expenses || [];

    // Filter by category
    var selectedCat = categoryFilter ? categoryFilter.value : '';
    if (selectedCat) {
      list = list.filter(function (e) {
        return e.category === selectedCat;
      });
    }

    // Filter by search keyword
    var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      list = list.filter(function (e) {
        return (
          e.description.toLowerCase().indexOf(query) !== -1 ||
          e.category.toLowerCase().indexOf(query) !== -1 ||
          e.paymentMethod.toLowerCase().indexOf(query) !== -1
        );
      });
    }

    // Sort by date descending
    list.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    // Update summary counts
    var totalAmount = list.reduce(function (sum, item) {
      return sum + (Number(item.amount) || 0);
    }, 0);

    var countElem = document.getElementById('expense-filtered-count');
    var sumElem = document.getElementById('expense-filtered-sum');
    if (countElem) countElem.textContent = list.length;
    if (sumElem) sumElem.textContent = window.FinApp.formatCurrency(totalAmount);

    if (!expenseTableBody) return;

    if (list.length === 0) {
      expenseTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No matching expense records found.</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function (exp) {
      html += '<tr>' +
        '<td><strong>' + window.FinApp.formatDate(exp.date) + '</strong></td>' +
        '<td><span class="badge badge-info">' + exp.category + '</span></td>' +
        '<td class="fw-bold text-danger">-' + window.FinApp.formatCurrency(exp.amount) + '</td>' +
        '<td><span class="badge badge-secondary">' + exp.paymentMethod + '</span></td>' +
        '<td>' + (exp.description || '—') + '</td>' +
        '<td>' +
          '<button class="btn btn-sm btn-secondary btn-edit-expense" data-id="' + exp.id + '">Edit</button> ' +
          '<button class="btn btn-sm btn-danger btn-delete-expense" data-id="' + exp.id + '">Delete</button>' +
        '</td>' +
      '</tr>';
    });

    expenseTableBody.innerHTML = html;
    bindTableActions();
  }

  // Bind click handlers for Edit and Delete buttons
  function bindTableActions() {
    var editBtns = document.querySelectorAll('.btn-edit-expense');
    editBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        openEditModal(id);
      });
    });

    var deleteBtns = document.querySelectorAll('.btn-delete-expense');
    deleteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteExpense(id);
      });
    });
  }

  // Open modal for editing an expense
  function openEditModal(id) {
    var data = window.FinData.get();
    var exp = (data.expenses || []).find(function (item) {
      return item.id === id;
    });

    if (!exp) return;

    currentEditId = id;
    document.getElementById('modal-expense-title').textContent = 'Edit Expense Record';
    document.getElementById('modal-expense-amount').value = exp.amount;
    document.getElementById('modal-expense-category').value = exp.category;
    document.getElementById('modal-expense-date').value = exp.date;
    document.getElementById('modal-expense-payment').value = exp.paymentMethod;
    document.getElementById('modal-expense-desc').value = exp.description || '';

    window.FinApp.openModal('expense-modal');
  }

  // Delete expense handler
  function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    var data = window.FinData.get();
    data.expenses = (data.expenses || []).filter(function (item) {
      return item.id !== id;
    });

    window.FinData.save(data);
    window.FinApp.showToast('Expense record deleted successfully.');
    renderExpensesTable();
  }

  // Handle Add Expense Form submit
  if (expenseForm) {
    expenseForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var amountInput = document.getElementById('expense-amount');
      var categoryInput = document.getElementById('expense-category');
      var dateInput = document.getElementById('expense-date');
      var paymentInput = document.getElementById('expense-payment');
      var descInput = document.getElementById('expense-description');

      var amount = parseFloat(amountInput.value);
      var category = categoryInput.value;
      var date = dateInput.value;
      var paymentMethod = paymentInput.value;
      var description = descInput.value.trim();

      if (isNaN(amount) || amount <= 0) {
        window.FinApp.showToast('Please enter a valid expense amount greater than 0.', 'warning');
        amountInput.focus();
        return;
      }

      if (!category) {
        window.FinApp.showToast('Please select a category.', 'warning');
        categoryInput.focus();
        return;
      }

      if (!date) {
        window.FinApp.showToast('Please select the date of the expense.', 'warning');
        dateInput.focus();
        return;
      }

      var newExpense = {
        id: 'exp-' + Date.now(),
        amount: amount,
        category: category,
        date: date,
        paymentMethod: paymentMethod,
        description: description || category
      };

      var data = window.FinData.get();
      if (!data.expenses) data.expenses = [];
      data.expenses.unshift(newExpense);
      window.FinData.save(data);

      window.FinApp.showToast('New expense added successfully!', 'success');
      expenseForm.reset();

      // Default date back to today
      dateInput.value = new Date().toISOString().split('T')[0];

      renderExpensesTable();
    });
  }

  // Modal edit form submit handler
  var modalEditForm = document.getElementById('modal-expense-form');
  if (modalEditForm) {
    modalEditForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!currentEditId) return;

      var amount = parseFloat(document.getElementById('modal-expense-amount').value);
      var category = document.getElementById('modal-expense-category').value;
      var date = document.getElementById('modal-expense-date').value;
      var paymentMethod = document.getElementById('modal-expense-payment').value;
      var description = document.getElementById('modal-expense-desc').value.trim();

      if (isNaN(amount) || amount <= 0) {
        window.FinApp.showToast('Please enter a valid amount.', 'warning');
        return;
      }

      var data = window.FinData.get();
      var itemIndex = (data.expenses || []).findIndex(function (item) {
        return item.id === currentEditId;
      });

      if (itemIndex !== -1) {
        data.expenses[itemIndex].amount = amount;
        data.expenses[itemIndex].category = category;
        data.expenses[itemIndex].date = date;
        data.expenses[itemIndex].paymentMethod = paymentMethod;
        data.expenses[itemIndex].description = description;

        window.FinData.save(data);
        window.FinApp.showToast('Expense updated successfully!', 'success');
        window.FinApp.closeModal('expense-modal');
        currentEditId = null;
        renderExpensesTable();
      }
    });
  }

  // Close modal button handler
  var closeModalBtn = document.getElementById('close-expense-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
      window.FinApp.closeModal('expense-modal');
      currentEditId = null;
    });
  }

  // Search & Filter event listeners
  if (searchInput) searchInput.addEventListener('input', renderExpensesTable);
  if (categoryFilter) categoryFilter.addEventListener('change', renderExpensesTable);

  // Set default date input to today
  var dateField = document.getElementById('expense-date');
  if (dateField && !dateField.value) {
    dateField.value = new Date().toISOString().split('T')[0];
  }

  // Initial table render
  renderExpensesTable();

});
