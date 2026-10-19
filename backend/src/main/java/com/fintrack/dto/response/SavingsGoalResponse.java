package com.fintrack.dto.response;

import com.fintrack.entity.SavingsGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoalResponse {
    private String id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentSaved;
    private LocalDate deadline;
    private String note;
    private boolean completed;
    private double progressPercent;
    private LocalDateTime createdAt;

    public static SavingsGoalResponse fromEntity(SavingsGoal goal) {
        boolean completed = goal.getCurrentSaved().compareTo(goal.getTargetAmount()) >= 0;
        double percent = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            percent = goal.getCurrentSaved()
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            if (percent > 100) percent = 100.0;
        }
        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentSaved(goal.getCurrentSaved())
                .deadline(goal.getDeadline())
                .note(goal.getNote())
                .completed(completed)
                .progressPercent(percent)
                .createdAt(goal.getCreatedAt())
                .build();
    }
}
