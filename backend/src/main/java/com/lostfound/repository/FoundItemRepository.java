package com.lostfound.repository;

import com.lostfound.entity.FoundItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    List<FoundItem> findByStatus(String status);
    Page<FoundItem> findByStatus(String status, Pageable pageable);
    List<FoundItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FoundItem> findByCategoryIgnoreCase(String category);

    @Query("SELECT f FROM FoundItem f WHERE (:category IS NULL OR LOWER(f.category) = LOWER(:category)) " +
           "AND (:locationId IS NULL OR f.location.id = :locationId) " +
           "AND (:query IS NULL OR LOWER(f.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<FoundItem> searchFoundItems(String query, String category, Long locationId);
}
