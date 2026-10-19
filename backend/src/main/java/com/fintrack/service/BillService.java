package com.fintrack.service;

import com.fintrack.dto.request.BillRequest;
import com.fintrack.dto.request.BillStatusRequest;
import com.fintrack.dto.response.BillResponse;
import com.fintrack.entity.Bill;
import com.fintrack.entity.User;
import com.fintrack.exception.BadRequestException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.BillRepository;
import com.fintrack.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<BillResponse> getAllBills(String status) {
        Long userId = securityUtils.getCurrentUserId();
        List<Bill> bills;
        if (StringUtils.hasText(status) && !"all".equalsIgnoreCase(status)) {
            // Capitalize properly if needed: e.g. "pending" -> "Pending", "paid" -> "Paid"
            String formattedStatus = status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
            bills = billRepository.findByUserIdAndStatusOrderByDueDateAsc(userId, formattedStatus);
        } else {
            bills = billRepository.findByUserIdOrderByDueDateAsc(userId);
        }
        return bills.stream().map(BillResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BillResponse getBillById(String id) {
        Long userId = securityUtils.getCurrentUserId();
        Bill bill = billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        return BillResponse.fromEntity(bill);
    }

    @Transactional
    public BillResponse createBill(BillRequest request) {
        User user = securityUtils.getCurrentUser();
        Bill bill = Bill.builder()
                .id(StringUtils.hasText(request.getId()) ? request.getId() : null)
                .user(user)
                .name(request.getName())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .frequency(request.getFrequency() != null ? request.getFrequency() : "Monthly")
                .status(request.getStatus() != null ? request.getStatus() : "Pending")
                .build();
        return BillResponse.fromEntity(billRepository.save(bill));
    }

    @Transactional
    public BillResponse updateBill(String id, BillRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        Bill bill = billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setDueDate(request.getDueDate());
        bill.setFrequency(request.getFrequency() != null ? request.getFrequency() : "Monthly");
        bill.setStatus(request.getStatus() != null ? request.getStatus() : bill.getStatus());
        return BillResponse.fromEntity(billRepository.save(bill));
    }

    @Transactional
    public void deleteBill(String id) {
        Long userId = securityUtils.getCurrentUserId();
        Bill bill = billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        billRepository.delete(bill);
    }

    @Transactional
    public String toggleBillStatus(String id) {
        Long userId = securityUtils.getCurrentUserId();
        Bill bill = billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        String newStatus = "Paid".equalsIgnoreCase(bill.getStatus()) ? "Pending" : "Paid";
        bill.setStatus(newStatus);
        billRepository.save(bill);
        return newStatus;
    }

    @Transactional
    public BillResponse updateBillStatus(String id, BillStatusRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        Bill bill = billRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        String newStatus = request.getStatus();
        if (!"Paid".equalsIgnoreCase(newStatus) && !"Pending".equalsIgnoreCase(newStatus)) {
            throw new BadRequestException("Status must be 'Paid' or 'Pending'");
        }
        bill.setStatus("Paid".equalsIgnoreCase(newStatus) ? "Paid" : "Pending");
        return BillResponse.fromEntity(billRepository.save(bill));
    }
}
