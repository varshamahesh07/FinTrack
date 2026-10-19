package com.fintrack.controller;

import com.fintrack.dto.request.DepositRequest;
import com.fintrack.dto.request.SavingsGoalRequest;
import com.fintrack.dto.response.SavingsGoalResponse;
import com.fintrack.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/savings", "/api/savings-goals"})
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllGoals() {
        List<SavingsGoalResponse> goals = savingsGoalService.getAllGoals();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "goals", goals
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getGoalById(@PathVariable String id) {
        SavingsGoalResponse goal = savingsGoalService.getGoalById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "goal", goal
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createGoal(@Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse goal = savingsGoalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "New savings goal created",
                "goal", goal
        ));
    }

    @PatchMapping("/{id}/deposit")
    public ResponseEntity<Map<String, Object>> depositFunds(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        BigDecimal amount = BigDecimal.ZERO;
        if (body.containsKey("amount")) {
            amount = new BigDecimal(body.get("amount").toString());
        }
        SavingsGoalResponse goal = savingsGoalService.deposit(id, amount);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Funds deposited successfully",
                "goal", goal
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateGoal(
            @PathVariable String id,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse goal = savingsGoalService.updateGoal(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Savings goal updated successfully",
                "goal", goal
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGoal(@PathVariable String id) {
        savingsGoalService.deleteGoal(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Savings goal removed"
        ));
    }
}
