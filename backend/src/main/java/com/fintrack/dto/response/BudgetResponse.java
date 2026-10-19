package com.fintrack.dto.response;

import com.fintrack.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private BigDecimal monthlyIncome;
    private BigDecimal food;
    private BigDecimal travel;
    private BigDecimal education;
    private BigDecimal bills;
    private BigDecimal other;
    private BigDecimal savingsTarget;
    private BigDecimal totalPlannedExpenses;
    private BigDecimal totalAllocated;
    private BigDecimal unallocatedRemaining;

    public static BudgetResponse fromEntity(Budget budget) {
        BigDecimal totalPlanned = budget.getFood()
                .add(budget.getTravel())
                .add(budget.getEducation())
                .add(budget.getBills())
                .add(budget.getOther());
        BigDecimal totalAllocated = totalPlanned.add(budget.getSavingsTarget());
        BigDecimal unallocated = budget.getMonthlyIncome().subtract(totalAllocated);

        return BudgetResponse.builder()
                .id(budget.getId())
                .monthlyIncome(budget.getMonthlyIncome())
                .food(budget.getFood())
                .travel(budget.getTravel())
                .education(budget.getEducation())
                .bills(budget.getBills())
                .other(budget.getOther())
                .savingsTarget(budget.getSavingsTarget())
                .totalPlannedExpenses(totalPlanned)
                .totalAllocated(totalAllocated)
                .unallocatedRemaining(unallocated)
                .build();
    }
}
