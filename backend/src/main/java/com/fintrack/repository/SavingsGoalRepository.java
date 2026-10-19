package com.fintrack.repository;

import com.fintrack.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, String> {

    List<SavingsGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SavingsGoal> findByIdAndUserId(String id, Long userId);

    @Query("SELECT SUM(s.currentSaved) FROM SavingsGoal s WHERE s.user.id = :userId")
    Optional<BigDecimal> sumCurrentSavedByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(s.targetAmount) FROM SavingsGoal s WHERE s.user.id = :userId")
    Optional<BigDecimal> sumTargetAmountByUserId(@Param("userId") Long userId);
}
