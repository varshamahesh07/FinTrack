package com.fintrack.controller;

import com.fintrack.dto.request.ExpenseRequest;
import com.fintrack.dto.response.ExpenseResponse;
import com.fintrack.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses(category, search);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "expenses", expenses
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getExpenseById(@PathVariable String id) {
        ExpenseResponse expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "expense", expense
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "New expense added successfully",
                "expense", expense
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateExpense(
            @PathVariable String id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse expense = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Expense updated successfully",
                "expense", expense
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Expense record deleted successfully"
        ));
    }
}
