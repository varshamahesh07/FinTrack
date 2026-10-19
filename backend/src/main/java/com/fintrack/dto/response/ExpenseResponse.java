package com.fintrack.dto.response;

import com.fintrack.entity.Expense;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private String id;
    private LocalDate date;
    private String category;
    private BigDecimal amount;
    private String paymentMethod;
    private String description;
    private LocalDateTime createdAt;

    public static ExpenseResponse fromEntity(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .date(expense.getDate())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .paymentMethod(expense.getPaymentMethod())
                .description(expense.getDescription())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
