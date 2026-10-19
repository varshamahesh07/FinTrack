package com.fintrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    @Builder.Default
    private boolean success = true;

    private SummaryData summary;
    private List<ExpenseResponse> recentExpenses;
    private List<BillResponse> upcomingBills;
    private ChartData chart;

    // Direct top-level fields for backwards-compatibility
    private BigDecimal monthlyIncome;
    private BigDecimal plannedExpenses;
    private BigDecimal actualExpenses;
    private BigDecimal remainingBudget;
    private BigDecimal totalSavings;
    private BigDecimal savingsTarget;
    private long pendingBillsCount;
    private String budgetStatus;
    private double budgetPercentUsed;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryData {
        @Builder.Default
        private String currency = "₹";
        private BigDecimal monthlyIncome;
        private BigDecimal plannedExpenses;
        private BigDecimal actualExpenses;
        private BigDecimal remainingBudget;
        private BigDecimal totalSavings;
        private BigDecimal savingsTarget;
        private BudgetStatusData budgetStatus;
        private int expenseCount;
        private long pendingBillsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetStatusData {
        private String label;
        private String type;
        private int percent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartData {
        private List<String> labels;
        private List<BigDecimal> planned;
        private List<BigDecimal> actual;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyExpenseEntry {
        private int month;
        private int year;
        private String label;
        private BigDecimal amount;
    }
}
