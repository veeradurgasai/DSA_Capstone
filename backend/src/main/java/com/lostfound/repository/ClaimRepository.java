package com.lostfound.repository;

import com.lostfound.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByFoundItemId(Long foundItemId);
    List<Claim> findByClaimantIdOrderByCreatedAtDesc(Long claimantId);
    List<Claim> findByStatus(String status);
    Page<Claim> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
    void deleteByFoundItemId(Long foundItemId);
}
