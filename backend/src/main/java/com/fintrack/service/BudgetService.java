package com.fintrack.service;

import com.fintrack.dto.request.BudgetRequest;
import com.fintrack.dto.response.BudgetResponse;
import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public BudgetResponse getBudget() {
        User user = securityUtils.getCurrentUser();
        Budget budget = budgetRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultBudget(user));
        return BudgetResponse.fromEntity(budget);
    }

    @Transactional
    public BudgetResponse saveBudget(BudgetRequest request) {
        User user = securityUtils.getCurrentUser();
        Budget budget = budgetRepository.findByUserId(user.getId())
                .orElse(Budget.builder().user(user).build());

        budget.setMonthlyIncome(request.getMonthlyIncome());
        budget.setFood(request.getFood() != null ? request.getFood() : java.math.BigDecimal.ZERO);
        budget.setTravel(request.getTravel() != null ? request.getTravel() : java.math.BigDecimal.ZERO);
        budget.setEducation(request.getEducation() != null ? request.getEducation() : java.math.BigDecimal.ZERO);
        budget.setBills(request.getBills() != null ? request.getBills() : java.math.BigDecimal.ZERO);
        budget.setOther(request.getOther() != null ? request.getOther() : java.math.BigDecimal.ZERO);
        budget.setSavingsTarget(request.getSavingsTarget() != null ? request.getSavingsTarget() : java.math.BigDecimal.ZERO);

        budgetRepository.save(budget);
        return BudgetResponse.fromEntity(budget);
    }

    private Budget createDefaultBudget(User user) {
        Budget budget = Budget.builder().user(user).build();
        return budgetRepository.save(budget);
    }
}
