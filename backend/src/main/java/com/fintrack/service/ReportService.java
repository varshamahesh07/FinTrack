package com.fintrack.service;

import com.fintrack.dto.response.DashboardSummaryResponse;
import com.fintrack.dto.response.ReportSummaryResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.repository.SavingsGoalRepository;
import com.fintrack.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public ReportSummaryResponse getReports() {
        User user = securityUtils.getCurrentUser();
        Long userId = user.getId();

        // Income & Budget
        Budget budget = budgetRepository.findByUserId(userId).orElse(null);
        BigDecimal monthlyIncome = budget != null ? budget.getMonthlyIncome() : BigDecimal.ZERO;

        // Actual expenses
        BigDecimal actualExpenses = expenseRepository.sumAmountByUserId(userId).orElse(BigDecimal.ZERO);

        // Total savings
        BigDecimal totalSavings = savingsGoalRepository.sumCurrentSavedByUserId(userId).orElse(BigDecimal.ZERO);

        // Remaining budget
        BigDecimal remainingBudget = monthlyIncome.subtract(actualExpenses);

        // Savings rate (%)
        int savingsRate = 0;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = totalSavings
                    .divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .intValue();
        }

        ReportSummaryResponse.KpiData kpiData = ReportSummaryResponse.KpiData.builder()
                .monthlyIncome(monthlyIncome)
                .actualExpenses(actualExpenses)
                .totalSavings(totalSavings)
                .remainingBudget(remainingBudget)
                .savingsRate(savingsRate)
                .build();

        // Category breakdown
        List<Object[]> categoryData = expenseRepository.sumAmountByCategory(userId);
        BigDecimal totalCategoryAmount = BigDecimal.ZERO;
        for (Object[] row : categoryData) {
            BigDecimal amt = (BigDecimal) row[1];
            if (amt != null) totalCategoryAmount = totalCategoryAmount.add(amt);
        }

        List<ReportSummaryResponse.CategoryBreakdownEntry> categoryBreakdown = new ArrayList<>();
        List<ReportSummaryResponse.CategoryExpenseEntry> legacyCategoryExpenses = new ArrayList<>();

        for (Object[] row : categoryData) {
            String cat = (String) row[0];
            BigDecimal amt = (BigDecimal) row[1];
            if (amt == null) amt = BigDecimal.ZERO;

            int pct = 0;
            if (totalCategoryAmount.compareTo(BigDecimal.ZERO) > 0) {
                pct = amt.divide(totalCategoryAmount, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .intValue();
            }

            categoryBreakdown.add(ReportSummaryResponse.CategoryBreakdownEntry.builder()
                    .category(cat)
                    .amount(amt)
                    .percentage(pct)
                    .build());

            legacyCategoryExpenses.add(ReportSummaryResponse.CategoryExpenseEntry.builder()
                    .category(cat)
                    .amount(amt)
                    .percentage(pct)
                    .build());
        }

        // Sort by amount descending
        categoryBreakdown.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        // Multi-Month Comparison (Last 5 Months)
        LocalDate now = LocalDate.now();
        List<String> months = new ArrayList<>();
        List<BigDecimal> incomeList = new ArrayList<>();
        List<BigDecimal> expensesList = new ArrayList<>();
        List<BigDecimal> savingsList = new ArrayList<>();

        // Group actual expenses by year-month
        List<Object[]> monthlyExpensesData = expenseRepository.sumAmountByMonth(userId);
        Map<String, BigDecimal> monthlyExpenseMap = new HashMap<>();
        for (Object[] row : monthlyExpensesData) {
            int m = ((Number) row[0]).intValue();
            int y = ((Number) row[1]).intValue();
            BigDecimal amt = (BigDecimal) row[2];
            monthlyExpenseMap.put(y + "-" + m, amt);
        }

        for (int i = 4; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            String monthName = d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            if (i == 0) {
                monthName += " (Current)";
            }
            months.add(monthName);
            incomeList.add(monthlyIncome);
            BigDecimal act = monthlyExpenseMap.getOrDefault(d.getYear() + "-" + d.getMonthValue(), i == 0 ? actualExpenses : BigDecimal.ZERO);
            expensesList.add(act);
            BigDecimal plannedSavings = budget != null ? budget.getSavingsTarget() : BigDecimal.ZERO;
            savingsList.add(plannedSavings);
        }

        ReportSummaryResponse.MonthlyComparisonData monthlyComparison = ReportSummaryResponse.MonthlyComparisonData.builder()
                .months(months)
                .income(incomeList)
                .expenses(expensesList)
                .savings(savingsList)
                .build();

        return ReportSummaryResponse.builder()
                .success(true)
                .kpis(kpiData)
                .categoryBreakdown(categoryBreakdown)
                .monthlyComparison(monthlyComparison)
                // legacy root properties
                .income(monthlyIncome)
                .actualExpenses(actualExpenses)
                .totalSavings(totalSavings)
                .remainingBudget(remainingBudget)
                .savingsRate(savingsRate)
                .categoryExpenses(legacyCategoryExpenses)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummary() {
        return getReports();
    }

    @Transactional(readOnly = true)
    public List<ReportSummaryResponse.CategoryExpenseEntry> getCategoryExpenses() {
        return getReports().getCategoryExpenses();
    }

    @Transactional(readOnly = true)
    public List<DashboardSummaryResponse.MonthlyExpenseEntry> getMonthlyExpenses() {
        Long userId = securityUtils.getCurrentUserId();
        return expenseRepository.sumAmountByMonth(userId)
                .stream()
                .map(row -> DashboardSummaryResponse.MonthlyExpenseEntry.builder()
                        .month(((Number) row[0]).intValue())
                        .year(((Number) row[1]).intValue())
                        .amount((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());
    }
}
