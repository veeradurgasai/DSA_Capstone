package com.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ClaimDTOs {

    public record ClaimRequest(
            @NotNull(message = "Found item ID is required")
            Long foundItemId,

            @NotBlank(message = "Detailed proof of ownership is required")
            String description,

            String finderNotes
    ) {
        public ClaimRequest(Long foundItemId, String description) {
            this(foundItemId, description, null);
        }
    }

    public record ClaimReviewRequest(
            @NotBlank(message = "Status must be APPROVED or REJECTED")
            String status,

            String reviewerNotes,
            String finderNotes
    ) {
        public ClaimReviewRequest(String status, String reviewerNotes) {
            this(status, reviewerNotes, null);
        }
    }

    public record ClaimResponse(
            Long id,
            Long foundItemId,
            String foundItemTitle,
            Long claimantId,
            String claimantName,
            String claimantEmail,
            String description,
            String status,
            LocalDateTime createdAt,
            LocalDateTime reviewedAt,
            String reviewerNotes,
            String finderNotes
    ) {
        public ClaimResponse(Long id, Long foundItemId, String foundItemTitle, Long claimantId,
                             String claimantName, String claimantEmail, String description,
                             String status, LocalDateTime createdAt, LocalDateTime reviewedAt,
                             String reviewerNotes) {
            this(id, foundItemId, foundItemTitle, claimantId, claimantName, claimantEmail,
                    description, status, createdAt, reviewedAt, reviewerNotes, null);
        }
    }
}
