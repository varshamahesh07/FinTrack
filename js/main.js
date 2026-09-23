/**
 * FinTrack - Personal Financial Management System
 * Core Application & UI Helpers (js/main.js)
 */

(function (window) {
  'use strict';

  var FinApp = {
    // Format numeric values into currency representation
    formatCurrency: function (amount, currency) {
      var curr = currency || (window.FinData && window.FinData.get().user.currency) || '$';
      var num = Number(amount) || 0;
      return curr + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    // Format ISO dates into human readable formats
    formatDate: function (dateStr) {
      if (!dateStr) return 'N/A';
      var d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    // Display temporary toast messages
    showToast: function (message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'toast ' + (type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : '');
      toast.textContent = message;

      container.appendChild(toast);

      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(function () {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3500);
    },

    // Modal display controllers
    openModal: function (modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeModal: function (modalId) {
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    // Set active link in sidebar navigation
    initNavigation: function () {
      var currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
      var navLinks = document.querySelectorAll('.menu-link');

      navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === currentPath) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    },

    // Mobile sidebar toggle handler
    initSidebarToggle: function () {
      var toggleBtn = document.getElementById('menu-toggle');
      var closeBtn = document.getElementById('sidebar-close');
      var sidebar = document.querySelector('.sidebar');
      var overlay = document.querySelector('.sidebar-overlay');

      function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
      }

      function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      }

      if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
      if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
      if (overlay) overlay.addEventListener('click', closeSidebar);
    },

    // Populate common topbar elements (current date, pending bill count, user name)
    initTopbar: function () {
      var dateElem = document.getElementById('topbar-current-date');
      if (dateElem) {
        var now = new Date();
        dateElem.textContent = now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      var alertCountElem = document.getElementById('topbar-alert-count');
      if (alertCountElem && window.FinData) {
        var summary = window.FinData.getSummary();
        alertCountElem.textContent = summary.pendingBillsCount;
        alertCountElem.style.display = summary.pendingBillsCount > 0 ? 'flex' : 'none';
      }

      var userNameElems = document.querySelectorAll('.user-name');
      if (window.FinData) {
        var user = window.FinData.get().user || {};
        userNameElems.forEach(function (elem) {
          if (elem) elem.textContent = user.name || 'Alex Johnson';
        });
      }
    },

    // Logout action
    logout: function () {
      if (confirm('Are you sure you want to sign out from FinTrack?')) {
        window.location.href = 'login.html';
      }
    }
  };

  // Auto-initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function () {
    FinApp.initNavigation();
    FinApp.initSidebarToggle();
    FinApp.initTopbar();

    // Bind logout button if present
    var logoutBtns = document.querySelectorAll('.btn-sidebar-logout, .btn-logout');
    logoutBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        FinApp.logout();
      });
    });
  });

  window.FinApp = FinApp;

})(window);
