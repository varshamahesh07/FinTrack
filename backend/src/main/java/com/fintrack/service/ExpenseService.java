package com.fintrack.service;

import com.fintrack.dto.request.ExpenseRequest;
import com.fintrack.dto.response.ExpenseResponse;
import com.fintrack.entity.Expense;
import com.fintrack.entity.User;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.ExpenseRepository;
import com.fintrack.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses(String category, String search) {
        Long userId = securityUtils.getCurrentUserId();
        List<Expense> expenses;
        if (StringUtils.hasText(category) || StringUtils.hasText(search)) {
            expenses = expenseRepository.findByUserIdWithFilters(
                    userId,
                    StringUtils.hasText(category) ? category : null,
                    StringUtils.hasText(search) ? search : null);
        } else {
            expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        }
        return expenses.stream().map(ExpenseResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(String id) {
        Long userId = securityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return ExpenseResponse.fromEntity(expense);
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = securityUtils.getCurrentUser();
        Expense expense = Expense.builder()
                .id(StringUtils.hasText(request.getId()) ? request.getId() : null)
                .user(user)
                .date(request.getDate())
                .category(request.getCategory())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .description(request.getDescription())
                .build();
        return ExpenseResponse.fromEntity(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse updateExpense(String id, ExpenseRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        expense.setDate(request.getDate());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setDescription(request.getDescription());
        return ExpenseResponse.fromEntity(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(String id) {
        Long userId = securityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        expenseRepository.delete(expense);
    }
}
