package com.fintrack.repository;

import com.fintrack.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {

    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    Optional<Expense> findByIdAndUserId(String id, Long userId);

    List<Expense> findByUserIdAndCategoryOrderByDateDesc(Long userId, String category);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    Optional<BigDecimal> sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> sumAmountByCategory(@Param("userId") Long userId);

    @Query("SELECT MONTH(e.date), YEAR(e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY YEAR(e.date), MONTH(e.date) ORDER BY YEAR(e.date), MONTH(e.date)")
    List<Object[]> sumAmountByMonth(@Param("userId") Long userId);

    List<Expense> findTop5ByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))  " +
           "ORDER BY e.date DESC")
    List<Expense> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("search") String search);
}
