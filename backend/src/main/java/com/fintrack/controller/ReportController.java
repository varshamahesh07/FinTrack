package com.fintrack.controller;

import com.fintrack.dto.response.DashboardSummaryResponse;
import com.fintrack.dto.response.ReportSummaryResponse;
import com.fintrack.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportSummaryResponse> getReports() {
        return ResponseEntity.ok(reportService.getReports());
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }

    @GetMapping("/category-expenses")
    public ResponseEntity<List<ReportSummaryResponse.CategoryExpenseEntry>> getCategoryExpenses() {
        return ResponseEntity.ok(reportService.getCategoryExpenses());
    }

    @GetMapping("/monthly-expenses")
    public ResponseEntity<List<DashboardSummaryResponse.MonthlyExpenseEntry>> getMonthlyExpenses() {
        return ResponseEntity.ok(reportService.getMonthlyExpenses());
    }
}
