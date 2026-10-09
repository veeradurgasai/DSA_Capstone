package com.lostfound.controller;

import com.lostfound.dto.ClaimDTOs.*;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ClaimRequest request) {
        Long userId = principal != null ? principal.getId() : 2L;
        return ResponseEntity.ok(claimService.submitClaim(userId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(claimService.getUserClaims(principal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> reviewClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long adminId = principal != null ? principal.getId() : 1L;
        return ResponseEntity.ok(claimService.reviewClaim(id, request, adminId));
    }
}
