package com.lostfound.repository;

import com.lostfound.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, Long> {
    List<MatchResult> findByLostItemIdOrderByMatchScoreDesc(Long lostItemId);
    List<MatchResult> findByFoundItemIdOrderByMatchScoreDesc(Long foundItemId);
    Optional<MatchResult> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);
    void deleteByLostItemId(Long lostItemId);
    void deleteByFoundItemId(Long foundItemId);
}
