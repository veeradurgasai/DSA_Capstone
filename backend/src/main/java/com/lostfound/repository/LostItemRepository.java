package com.lostfound.repository;

import com.lostfound.entity.LostItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByStatus(String status);
    Page<LostItem> findByStatus(String status, Pageable pageable);
    List<LostItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<LostItem> findByCategoryIgnoreCase(String category);

    @Query("SELECT l FROM LostItem l WHERE (:category IS NULL OR LOWER(l.category) = LOWER(:category)) " +
           "AND (:locationId IS NULL OR l.location.id = :locationId) " +
           "AND (:query IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<LostItem> searchLostItems(String query, String category, Long locationId);
}
