package com.fintrack.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Monthly income is required")
    @DecimalMin(value = "0.0", message = "Monthly income cannot be negative")
    private BigDecimal monthlyIncome;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal food = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal travel = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal education = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal bills = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal other = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal savingsTarget = BigDecimal.ZERO;
}
