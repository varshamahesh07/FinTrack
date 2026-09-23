/**
 * FinTrack - Personal Financial Management System
 * Bills & Reminders Management (js/bills.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  if (!window.FinData || !window.FinApp) {
    console.error('FinTrack core scripts not loaded.');
    return;
  }

  var billsTableBody = document.getElementById('bills-table-body');
  var addBillForm = document.getElementById('add-bill-form');
  var filterStatus = document.getElementById('bill-filter-status');

  // Calculate day difference between today and due date
  function getDaysUntilDue(dueDateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var due = new Date(dueDateStr + 'T00:00:00');
    var diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Render bills list & reminder metrics
  function renderBills() {
    var data = window.FinData.get();
    var bills = data.bills || [];

    var todayStr = new Date().toISOString().split('T')[0];

    // Compute summaries
    var totalPending = 0;
    var dueWithin7Days = 0;
    var overdueCount = 0;

    bills.forEach(function (bill) {
      if (bill.status !== 'Paid') {
        totalPending += Number(bill.amount) || 0;
        var days = getDaysUntilDue(bill.dueDate);
        if (days < 0) {
          overdueCount++;
        } else if (days <= 7) {
          dueWithin7Days++;
        }
      }
    });

    // Populate top summary cards
    var totalPendingElem = document.getElementById('bills-summary-pending-amount');
    var dueSoonElem = document.getElementById('bills-summary-due-soon-count');
    var overdueElem = document.getElementById('bills-summary-overdue-count');

    if (totalPendingElem) totalPendingElem.textContent = window.FinApp.formatCurrency(totalPending);
    if (dueSoonElem) dueSoonElem.textContent = dueWithin7Days + ' Bills';
    if (overdueElem) {
      overdueElem.textContent = overdueCount + ' Bills';
      overdueElem.className = 'metric-value ' + (overdueCount > 0 ? 'text-danger' : 'text-success');
    }

    if (!billsTableBody) return;

    // Filter by status if selected
    var filter = filterStatus ? filterStatus.value : 'all';
    var filteredBills = bills.filter(function (b) {
      if (filter === 'pending') return b.status === 'Pending';
      if (filter === 'paid') return b.status === 'Paid';
      return true;
    });

    // Sort by due date ascending
    filteredBills.sort(function (a, b) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (filteredBills.length === 0) {
      billsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No matching bills found.</td></tr>';
      return;
    }

    var html = '';
    filteredBills.forEach(function (bill) {
      var days = getDaysUntilDue(bill.dueDate);
      var statusBadge = '';
      var reminderNote = '';

      if (bill.status === 'Paid') {
        statusBadge = '<span class="badge badge-success">Paid</span>';
        reminderNote = '<span class="text-muted" style="font-size: 0.8rem;">Settled</span>';
      } else if (days < 0) {
        statusBadge = '<span class="badge badge-danger">Overdue (' + Math.abs(days) + 'd)</span>';
        reminderNote = '<span class="text-danger fw-semibold" style="font-size: 0.8rem;">Immediate action needed</span>';
      } else if (days === 0) {
        statusBadge = '<span class="badge badge-warning">Due Today!</span>';
        reminderNote = '<span class="text-warning fw-semibold" style="font-size: 0.8rem;">Due Today</span>';
      } else if (days <= 7) {
        statusBadge = '<span class="badge badge-warning">Due in ' + days + ' days</span>';
        reminderNote = '<span class="text-warning" style="font-size: 0.8rem;">Upcoming</span>';
      } else {
        statusBadge = '<span class="badge badge-info">Due in ' + days + ' days</span>';
        reminderNote = '<span class="text-muted" style="font-size: 0.8rem;">On schedule</span>';
      }

      var toggleBtnText = bill.status === 'Paid' ? 'Mark Pending' : 'Mark Paid';
      var toggleBtnClass = bill.status === 'Paid' ? 'btn-secondary' : 'btn-primary';

      html += '<tr>' +
        '<td>' +
          '<strong>' + bill.name + '</strong>' +
          '<div style="font-size: 0.775rem; color: #64748b;">' + bill.frequency + ' bill</div>' +
        '</td>' +
        '<td class="fw-bold">' + window.FinApp.formatCurrency(bill.amount) + '</td>' +
        '<td>' + window.FinApp.formatDate(bill.dueDate) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + reminderNote + '</td>' +
        '<td>' +
          '<button class="btn btn-sm ' + toggleBtnClass + ' btn-toggle-bill" data-id="' + bill.id + '">' + toggleBtnText + '</button> ' +
          '<button class="btn btn-sm btn-outline text-danger btn-delete-bill" data-id="' + bill.id + '">Delete</button>' +
        '</td>' +
      '</tr>';
    });

    billsTableBody.innerHTML = html;
    bindBillActions();
  }

  // Bind actions for Status Toggle and Delete
  function bindBillActions() {
    var toggleBtns = document.querySelectorAll('.btn-toggle-bill');
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        toggleBillStatus(id);
      });
    });

    var deleteBtns = document.querySelectorAll('.btn-delete-bill');
    deleteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteBill(id);
      });
    });
  }

  // Toggle bill Paid / Pending status
  function toggleBillStatus(id) {
    var data = window.FinData.get();
    var bill = (data.bills || []).find(function (b) {
      return b.id === id;
    });

    if (bill) {
      bill.status = bill.status === 'Paid' ? 'Pending' : 'Paid';
      window.FinData.save(data);

      var msg = bill.status === 'Paid' ? 'Bill marked as Paid! Great job.' : 'Bill status changed back to Pending.';
      window.FinApp.showToast(msg, bill.status === 'Paid' ? 'success' : 'info');

      // Update topbar notification count
      window.FinApp.initTopbar();
      renderBills();
    }
  }

  // Delete bill
  function deleteBill(id) {
    if (!confirm('Are you sure you want to delete this bill reminder?')) {
      return;
    }

    var data = window.FinData.get();
    data.bills = (data.bills || []).filter(function (b) {
      return b.id !== id;
    });

    window.FinData.save(data);
    window.FinApp.showToast('Bill removed.');
    window.FinApp.initTopbar();
    renderBills();
  }

  // Handle Add Bill Form submission
  if (addBillForm) {
    addBillForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('bill-name');
      var amountInput = document.getElementById('bill-amount');
      var dueDateInput = document.getElementById('bill-due-date');
      var frequencyInput = document.getElementById('bill-frequency');
      var statusInput = document.getElementById('bill-status');

      var name = nameInput.value.trim();
      var amount = parseFloat(amountInput.value);
      var dueDate = dueDateInput.value;
      var frequency = frequencyInput.value;
      var status = statusInput.value;

      if (!name) {
        window.FinApp.showToast('Please enter the bill name.', 'warning');
        nameInput.focus();
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        window.FinApp.showToast('Please enter a valid bill amount greater than 0.', 'warning');
        amountInput.focus();
        return;
      }

      if (!dueDate) {
        window.FinApp.showToast('Please specify the bill due date.', 'warning');
        dueDateInput.focus();
        return;
      }

      var newBill = {
        id: 'bill-' + Date.now(),
        name: name,
        amount: amount,
        dueDate: dueDate,
        frequency: frequency,
        status: status
      };

      var data = window.FinData.get();
      if (!data.bills) data.bills = [];
      data.bills.push(newBill);
      window.FinData.save(data);

      window.FinApp.showToast('Bill reminder added successfully!', 'success');
      addBillForm.reset();
      window.FinApp.initTopbar();
      renderBills();
    });
  }

  // Filter change handler
  if (filterStatus) {
    filterStatus.addEventListener('change', renderBills);
  }

  // Set default due date to 5 days in future
  var dueField = document.getElementById('bill-due-date');
  if (dueField && !dueField.value) {
    var d = new Date();
    d.setDate(d.getDate() + 5);
    dueField.value = d.toISOString().split('T')[0];
  }

  // Initial render
  renderBills();

});
