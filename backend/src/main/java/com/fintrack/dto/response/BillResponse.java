package com.fintrack.dto.response;

import com.fintrack.entity.Bill;
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
public class BillResponse {
    private String id;
    private String name;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String frequency;
    private String status;
    private LocalDateTime createdAt;

    public static BillResponse fromEntity(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .name(bill.getName())
                .amount(bill.getAmount())
                .dueDate(bill.getDueDate())
                .frequency(bill.getFrequency())
                .status(bill.getStatus())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}
