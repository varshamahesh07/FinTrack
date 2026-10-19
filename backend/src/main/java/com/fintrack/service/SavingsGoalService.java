package com.fintrack.service;

import com.fintrack.dto.request.SavingsGoalRequest;
import com.fintrack.dto.response.SavingsGoalResponse;
import com.fintrack.entity.SavingsGoal;
import com.fintrack.entity.User;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.SavingsGoalRepository;
import com.fintrack.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> getAllGoals() {
        Long userId = securityUtils.getCurrentUserId();
        return savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(SavingsGoalResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SavingsGoalResponse getGoalById(String id) {
        Long userId = securityUtils.getCurrentUserId();
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + id));
        return SavingsGoalResponse.fromEntity(goal);
    }

    @Transactional
    public SavingsGoalResponse createGoal(SavingsGoalRequest request) {
        User user = securityUtils.getCurrentUser();
        SavingsGoal goal = SavingsGoal.builder()
                .id(StringUtils.hasText(request.getId()) ? request.getId() : null)
                .user(user)
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentSaved(request.getCurrentSaved() != null ? request.getCurrentSaved() : BigDecimal.ZERO)
                .deadline(request.getDeadline())
                .note(request.getNote())
                .build();
        return SavingsGoalResponse.fromEntity(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse updateGoal(String id, SavingsGoalRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + id));
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentSaved(request.getCurrentSaved() != null ? request.getCurrentSaved() : BigDecimal.ZERO);
        goal.setDeadline(request.getDeadline());
        goal.setNote(request.getNote());
        return SavingsGoalResponse.fromEntity(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse deposit(String id, BigDecimal amount) {
        Long userId = securityUtils.getCurrentUserId();
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + id));
        BigDecimal addAmount = amount != null ? amount : BigDecimal.ZERO;
        goal.setCurrentSaved(goal.getCurrentSaved().add(addAmount));
        return SavingsGoalResponse.fromEntity(savingsGoalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String id) {
        Long userId = securityUtils.getCurrentUserId();
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + id));
        savingsGoalRepository.delete(goal);
    }
}
