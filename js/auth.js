/**
 * FinTrack - Personal Financial Management System
 * Authentication & Form Validation (js/auth.js)
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Email regex validator
  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // Set field error message
  function setError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    if (input) {
      input.style.borderColor = message ? '#ef4444' : '#e2e8f0';
    }
    if (error) {
      error.textContent = message || '';
    }
  }

  // Clear all errors
  function clearErrors() {
    var errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(function (el) {
      el.textContent = '';
    });
    var inputElements = document.querySelectorAll('.form-control');
    inputElements.forEach(function (input) {
      input.style.borderColor = '#e2e8f0';
    });
  }

  // ==========================================
  // Login Form Validation
  // ==========================================
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      var hasError = false;

      if (!email) {
        setError('login-email', 'login-email-error', 'Please enter your email address');
        hasError = true;
      } else if (!isValidEmail(email)) {
        setError('login-email', 'login-email-error', 'Please enter a valid email format (e.g. user@domain.com)');
        hasError = true;
      }

      if (!password) {
        setError('login-password', 'login-password-error', 'Please enter your password');
        hasError = true;
      } else if (password.length < 6) {
        setError('login-password', 'login-password-error', 'Password must be at least 6 characters long');
        hasError = true;
      }

      if (!hasError) {
        // Successful mock client authentication
        if (window.FinApp) {
          window.FinApp.showToast('Login successful! Redirecting to Dashboard...', 'success');
        }
        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 600);
      }
    });
  }

  // ==========================================
  // Register Form Validation
  // ==========================================
  var registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var name = document.getElementById('register-name').value.trim();
      var email = document.getElementById('register-email').value.trim();
      var password = document.getElementById('register-password').value;
      var confirmPassword = document.getElementById('register-confirm-password').value;
      var hasError = false;

      if (!name) {
        setError('register-name', 'register-name-error', 'Full name is required');
        hasError = true;
      } else if (name.length < 2) {
        setError('register-name', 'register-name-error', 'Name must be at least 2 characters');
        hasError = true;
      }

      if (!email) {
        setError('register-email', 'register-email-error', 'Email address is required');
        hasError = true;
      } else if (!isValidEmail(email)) {
        setError('register-email', 'register-email-error', 'Please enter a valid email address');
        hasError = true;
      }

      if (!password) {
        setError('register-password', 'register-password-error', 'Password is required');
        hasError = true;
      } else if (password.length < 6) {
        setError('register-password', 'register-password-error', 'Password must be at least 6 characters');
        hasError = true;
      }

      if (!confirmPassword) {
        setError('register-confirm-password', 'register-confirm-password-error', 'Please confirm your password');
        hasError = true;
      } else if (password !== confirmPassword) {
        setError('register-confirm-password', 'register-confirm-password-error', 'Passwords do not match');
        hasError = true;
      }

      if (!hasError) {
        // Update user state name if FinData is available
        if (window.FinData) {
          var state = window.FinData.get();
          state.user.name = name;
          state.user.email = email;
          window.FinData.save(state);
        }

        if (window.FinApp) {
          window.FinApp.showToast('Account registered successfully! Redirecting...', 'success');
        }
        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 700);
      }
    });
  }

  // ==========================================
  // Password Visibility Toggle
  // ==========================================
  var toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = this.getAttribute('data-target');
      var input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = 'Hide';
        } else {
          input.type = 'password';
          this.textContent = 'Show';
        }
      }
    });
  });
});
