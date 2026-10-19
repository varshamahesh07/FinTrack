package com.fintrack.repository;

import com.fintrack.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {

    List<Bill> findByUserIdOrderByDueDateAsc(Long userId);

    Optional<Bill> findByIdAndUserId(String id, Long userId);

    List<Bill> findByUserIdAndStatusOrderByDueDateAsc(Long userId, String status);

    long countByUserIdAndStatusNot(Long userId, String status);

    List<Bill> findByUserIdAndDueDateBetweenOrderByDueDateAsc(Long userId, LocalDate start, LocalDate end);
}
