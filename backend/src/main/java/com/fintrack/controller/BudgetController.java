package com.fintrack.controller;

import com.fintrack.dto.request.BudgetRequest;
import com.fintrack.dto.response.BudgetResponse;
import com.fintrack.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBudget() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "budget", budgetService.getBudget()
        ));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> saveBudget(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse budget = budgetService.saveBudget(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Financial plan updated successfully",
                "budget", budget
        ));
    }
}
