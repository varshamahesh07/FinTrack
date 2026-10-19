package com.fintrack.controller;

import com.fintrack.dto.request.BillRequest;
import com.fintrack.dto.request.BillStatusRequest;
import com.fintrack.dto.response.BillResponse;
import com.fintrack.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBills(
            @RequestParam(required = false) String status) {
        List<BillResponse> bills = billService.getAllBills(status);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "bills", bills
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBillById(@PathVariable String id) {
        BillResponse bill = billService.getBillById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "bill", bill
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBill(@Valid @RequestBody BillRequest request) {
        BillResponse bill = billService.createBill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Bill reminder added successfully",
                "bill", bill
        ));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleBillStatus(@PathVariable String id) {
        String newStatus = billService.toggleBillStatus(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newStatus", newStatus,
                "message", "Bill marked as " + newStatus
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBillStatus(
            @PathVariable String id,
            @Valid @RequestBody BillStatusRequest request) {
        BillResponse bill = billService.updateBillStatus(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newStatus", bill.getStatus(),
                "message", "Bill status updated to " + bill.getStatus(),
                "bill", bill
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBill(
            @PathVariable String id,
            @Valid @RequestBody BillRequest request) {
        BillResponse bill = billService.updateBill(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bill updated successfully",
                "bill", bill
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBill(@PathVariable String id) {
        billService.deleteBill(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bill removed"
        ));
    }
}
