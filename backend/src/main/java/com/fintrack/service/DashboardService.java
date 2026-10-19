package com.fintrack.service;

import com.fintrack.dto.response.BillResponse;
import com.fintrack.dto.response.DashboardSummaryResponse;
import com.fintrack.dto.response.ExpenseResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.repository.BillRepository;
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
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final BillRepository billRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        User user = securityUtils.getCurrentUser();
        Long userId = user.getId();

        // 1. Budget
        Budget budget = budgetRepository.findByUserId(userId).orElse(null);
        BigDecimal monthlyIncome = budget != null ? budget.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal plannedExpenses = BigDecimal.ZERO;
        if (budget != null) {
            plannedExpenses = budget.getFood()
                    .add(budget.getTravel())
                    .add(budget.getEducation())
                    .add(budget.getBills())
                    .add(budget.getOther());
        }

        // 2. Actual expenses
        BigDecimal actualExpenses = expenseRepository.sumAmountByUserId(userId).orElse(BigDecimal.ZERO);

        // 3. Remaining budget
        BigDecimal remainingBudget = monthlyIncome.subtract(actualExpenses);

        // 4. Savings
        BigDecimal totalSavings = savingsGoalRepository.sumCurrentSavedByUserId(userId).orElse(BigDecimal.ZERO);
        BigDecimal savingsTarget = savingsGoalRepository.sumTargetAmountByUserId(userId).orElse(BigDecimal.ZERO);

        // 5. Pending bills count
        long pendingBillsCount = billRepository.countByUserIdAndStatusNot(userId, "Paid");

        // 6. Expense count
        int expenseCount = (int) expenseRepository.findByUserIdOrderByDateDesc(userId).size();

        // 7. Dynamic Budget Status
        int percentUsed = 0;
        if (plannedExpenses.compareTo(BigDecimal.ZERO) > 0) {
            percentUsed = actualExpenses
                    .divide(plannedExpenses, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .intValue();
        }

        String statusLabel = "Healthy & On Track";
        String statusType = "success";
        if (actualExpenses.compareTo(plannedExpenses) > 0) {
            statusLabel = "Over Budget!";
            statusType = "danger";
        } else if (percentUsed >= 80) {
            statusLabel = "Approaching Limit";
            statusType = "warning";
        }

        DashboardSummaryResponse.BudgetStatusData budgetStatusData = DashboardSummaryResponse.BudgetStatusData.builder()
                .label(statusLabel)
                .type(statusType)
                .percent(percentUsed)
                .build();

        // 8. Summary object
        DashboardSummaryResponse.SummaryData summaryData = DashboardSummaryResponse.SummaryData.builder()
                .currency(user.getCurrency() != null ? user.getCurrency() : "₹")
                .monthlyIncome(monthlyIncome)
                .plannedExpenses(plannedExpenses)
                .actualExpenses(actualExpenses)
                .remainingBudget(remainingBudget)
                .totalSavings(totalSavings)
                .savingsTarget(savingsTarget)
                .budgetStatus(budgetStatusData)
                .expenseCount(expenseCount)
                .pendingBillsCount(pendingBillsCount)
                .build();

        // 9. Recent expenses (top 5)
        List<ExpenseResponse> recentExpenses = expenseRepository
                .findTop5ByUserIdOrderByDateDesc(userId)
                .stream().map(ExpenseResponse::fromEntity).collect(Collectors.toList());

        // 10. Upcoming bills (pending bills ordered by due date, up to 4)
        List<BillResponse> upcomingBills = billRepository
                .findByUserIdAndStatusOrderByDueDateAsc(userId, "Pending")
                .stream().limit(4).map(BillResponse::fromEntity).collect(Collectors.toList());

        // 11. Chart data: last 4 months comparison
        LocalDate now = LocalDate.now();
        List<String> labels = new ArrayList<>();
        List<BigDecimal> plannedList = new ArrayList<>();
        List<BigDecimal> actualList = new ArrayList<>();

        // Group actual expenses by year-month
        List<Object[]> monthlyExpensesData = expenseRepository.sumAmountByMonth(userId);
        Map<String, BigDecimal> monthlyExpenseMap = new HashMap<>();
        for (Object[] row : monthlyExpensesData) {
            int m = ((Number) row[0]).intValue();
            int y = ((Number) row[1]).intValue();
            BigDecimal amt = (BigDecimal) row[2];
            monthlyExpenseMap.put(y + "-" + m, amt);
        }

        for (int i = 3; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            String monthName = d.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            if (i == 0) {
                monthName += " (Current)";
            }
            labels.add(monthName);
            plannedList.add(plannedExpenses);
            BigDecimal act = monthlyExpenseMap.getOrDefault(d.getYear() + "-" + d.getMonthValue(), i == 0 ? actualExpenses : BigDecimal.ZERO);
            actualList.add(act);
        }

        DashboardSummaryResponse.ChartData chartData = DashboardSummaryResponse.ChartData.builder()
                .labels(labels)
                .planned(plannedList)
                .actual(actualList)
                .build();

        return DashboardSummaryResponse.builder()
                .success(true)
                .summary(summaryData)
                .recentExpenses(recentExpenses)
                .upcomingBills(upcomingBills)
                .chart(chartData)
                // backwards-compat root fields
                .monthlyIncome(monthlyIncome)
                .plannedExpenses(plannedExpenses)
                .actualExpenses(actualExpenses)
                .remainingBudget(remainingBudget)
                .totalSavings(totalSavings)
                .savingsTarget(savingsTarget)
                .pendingBillsCount(pendingBillsCount)
                .budgetStatus(statusLabel)
                .budgetPercentUsed(percentUsed)
                .build();
    }
}
