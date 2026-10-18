# FinTrack – Personal Financial Management System

A clean, modern, and professional frontend for a college Web Technology project.

---

## 📌 Project Overview
**FinTrack** is a client-side Personal Financial Management System designed to help individuals and students track daily expenditures, plan monthly category budgets, set and monitor savings goals, and manage recurring bill reminders with automated due-date calculations.

> **Important Academic Compliance Note**:
> This project is 100% deterministic and **does NOT utilize AI at runtime** (no AI chatbots, no AI financial advisors, no OpenAI/Gemini APIs, no Machine Learning, and no AI prediction engines). All calculations, reminders, and progress milestones are executed using standard JavaScript algorithms.

---

## 🛠️ Built With
- **HTML5**: Semantic tags, accessible forms, ARIA attributes.
- **CSS3**: Custom CSS variables, Flexbox, CSS Grid, mobile-responsive layout.
- **JavaScript (ES6)**: Modular, event-driven client-side data store, real-time budgeting math, and form validation.
- **Chart.js (v4.x CDN)**: Category-wise doughnut charts and multi-month comparative bar charts.
- **localStorage**: Client-side demo data persistence (no backend or database required).

---

## 📂 Folder Structure

```text
FinTrack/
│
├── index.html              # 1. Landing Page (Tagline: Plan. Track. Save., Features, CTAs)
├── login.html              # 2. Login Page (Validation feedback & demo credentials)
├── register.html           # 3. Register Page (Client-side validation & password match)
├── dashboard.html          # 4. Overview Dashboard (6 summary cards, budget status, alerts)
├── planning.html           # 5. Financial Planning (Budget planner form & dynamic math)
├── expenses.html           # 6. Daily Expenses (Add/Edit expense modal & interactive table)
├── savings.html            # 7. Savings Goals (Progress bars & milestone appreciation)
├── bills.html              # 8. Bills & Reminders (Upcoming bills, due calculations & status)
├── reports.html            # 9. Reports & Analytics (Chart.js visualizations & print view)
│
├── css/
│   ├── style.css           # Design system tokens, buttons, cards, tables, forms, modals
│   ├── dashboard.css       # App layout, responsive sidebar drawer, topbar, metric cards
│   ├── auth.css            # Authentication views styling & toggles
│   └── landing.css         # Marketing hero, feature grid, and landing footer
│
├── js/
│   ├── data.js             # Central localStorage store with sample financial records
│   ├── main.js             # UI helpers (formatting, active links, drawer toggle, toasts)
│   ├── auth.js             # Login and registration validation
│   ├── dashboard.js        # Summary card metrics & monthly expense chart
│   ├── planning.js         # Real-time allocation math & zero-based budgeting checks
│   ├── expenses.js         # Expense table CRUD (Add, Edit, Delete, Filter, Search)
│   ├── savings.js          # Savings progress tracker & target-reached celebrations
│   ├── bills.js            # Date-based overdue/upcoming status calculations
│   └── reports.js          # Category Doughnut chart & comparative bar chart via Chart.js
│
├── assets/
│   └── icons/
│       └── favicon.svg     # FinTrack brand icon
│
└── README.md               # Project documentation and guide
```

---

## 🚀 How to Run the Project
1. No Node.js, PHP, or web server setup is required.
2. Double-click or open **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Alternatively, if using VS Code, right-click `index.html` and select **"Open with Live Server"**.

---

## 🧭 Key Features & Pages Walkthrough

### 1. Landing Page (`index.html`)
- FinTrack branding with tagline **"Plan. Track. Save."**
- Overview of 4 core modules: Expense Tracking, Budget Monitoring, Savings Goals, Bill Reminders.
- Direct links to login, registration, and live dashboard demo.

### 2. Login & Register Pages (`login.html`, `register.html`)
- Full client-side input validation (email format, password length, password confirmation matching).
- Password show/hide toggle.
- Pre-filled demo credentials for quick testing.

### 3. Dashboard (`dashboard.html`)
- **6 Summary Metric Cards**: Total Income, Planned Expenses, Actual Expenses, Remaining Budget, Total Savings, Savings Target.
- **Budget Status Alert**: Visual indication of budget health (e.g., Healthy, Approaching Limit, Over Budget).
- **Recent Expenses Table**: Last 5 transactions.
- **Upcoming Bills**: Critical payments due soon.
- **Financial Alerts**: Milestone celebrations and due-date warnings.
- **Monthly Trend Chart**: Interactive Chart.js bar chart.

### 4. Financial Planning (`planning.html`)
- Category budget inputs: Food, Travel, Education, Bills & Utilities, Other Discretionary, Savings Target.
- **Real-Time Dynamic Math**: Updates total planned expenses and remaining unallocated balance as you type.

### 5. Daily Expenses (`expenses.html`)
- Add new expense with Amount, Category, Date, Payment Method, and Description.
- Live searchable & category-filtered transaction table.
- Interactive **Edit** modal and **Delete** actions.

### 6. Savings Goals (`savings.html`)
- Visual progress bars with percentage indicators.
- **Appreciation Milestone Banner**: Automatically displayed when 100% of a target is achieved.
- Quick `+₹50` and `+₹100` deposit buttons to test goal progression.

### 7. Bills & Reminders (`bills.html`)
- Date-based status calculation (**Overdue**, **Due Today**, **Due in X Days**, **Paid**).
- One-click toggle to mark bills as Paid or Pending.
- Filter by All, Pending, or Paid bills.

### 8. Reports & Analytics (`reports.html`)
- Financial scorecard with Savings Rate metric.
- **Category-Wise Expense Distribution**: Interactive Chart.js Doughnut chart with category breakdown.
- **Multi-Month Financial Comparison**: Comparative bar chart of Inflow vs. Spending vs. Savings.
- **Print / Save Report**: Print-friendly report view.
