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
public class ReportSummaryResponse {

    @Builder.Default
    private boolean success = true;

    private KpiData kpis;
    private List<CategoryBreakdownEntry> categoryBreakdown;
    private MonthlyComparisonData monthlyComparison;

    // Backwards-compatible fields
    private BigDecimal income;
    private BigDecimal actualExpenses;
    private BigDecimal totalSavings;
    private BigDecimal remainingBudget;
    private double savingsRate;
    private List<CategoryExpenseEntry> categoryExpenses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiData {
        private BigDecimal monthlyIncome;
        private BigDecimal actualExpenses;
        private BigDecimal totalSavings;
        private BigDecimal remainingBudget;
        private int savingsRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownEntry {
        private String category;
        private BigDecimal amount;
        private int percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyComparisonData {
        private List<String> months;
        private List<BigDecimal> income;
        private List<BigDecimal> expenses;
        private List<BigDecimal> savings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryExpenseEntry {
        private String category;
        private BigDecimal amount;
        private double percentage;
    }
}
