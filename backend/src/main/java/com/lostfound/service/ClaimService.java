package com.lostfound.service;

import com.lostfound.dto.ClaimDTOs.*;
import com.lostfound.entity.*;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;

    public ClaimService(ClaimRepository claimRepository,
                        FoundItemRepository foundItemRepository,
                        UserRepository userRepository,
                        NotificationRepository notificationRepository,
                        ActivityLogRepository activityLogRepository) {
        this.claimRepository = claimRepository;
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public ClaimResponse submitClaim(Long claimantUserId, ClaimRequest request) {
        User claimant = userRepository.findById(claimantUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + claimantUserId));
        FoundItem foundItem = foundItemRepository.findById(request.foundItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + request.foundItemId()));

        if (foundItem.getUser().getId().equals(claimantUserId)) {
            throw new BadRequestException("You cannot submit a claim on an item you reported finding.");
        }

        Claim claim = new Claim();
        claim.setClaimant(claimant);
        claim.setFoundItem(foundItem);
        claim.setDescription(request.description());
        if (request.finderNotes() != null) {
            claim.setFinderNotes(request.finderNotes());
        }
        claim.setStatus("PENDING");

        Claim saved = claimRepository.save(claim);

        // Notify item finder
        Notification notifFinder = new Notification(
                foundItem.getUser(),
                "New Claim Submitted",
                String.format("A student has filed a claim on your found item: \"%s\".", foundItem.getTitle()),
                "CLAIM",
                "/claims"
        );
        notificationRepository.save(notifFinder);

        activityLogRepository.save(new ActivityLog(claimant, "CLAIM_SUBMIT", "Submitted claim on Found Item #" + foundItem.getId(), "127.0.0.1"));

        return mapToResponse(saved);
    }

    @Transactional
    public ClaimResponse reviewClaim(Long claimId, ClaimReviewRequest request, Long reviewerUserId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + claimId));

        String newStatus = request.status().toUpperCase();
        if (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED")) {
            throw new BadRequestException("Status must be APPROVED or REJECTED.");
        }

        claim.setStatus(newStatus);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setReviewerNotes(request.reviewerNotes());
        if (request.finderNotes() != null) {
            claim.setFinderNotes(request.finderNotes());
        }

        Claim saved = claimRepository.save(claim);

        if ("APPROVED".equals(newStatus)) {
            FoundItem foundItem = claim.getFoundItem();
            foundItem.setStatus("CLAIMED");
            foundItemRepository.save(foundItem);
        }

        // Notify claimant
        Notification notif = new Notification(
                claim.getClaimant(),
                "Claim Decision: " + newStatus,
                String.format("Your claim for \"%s\" has been %s. Notes: %s",
                        claim.getFoundItem().getTitle(), newStatus,
                        (request.reviewerNotes() != null ? request.reviewerNotes() : "Reviewed by admin.")),
                "CLAIM",
                "/claims"
        );
        notificationRepository.save(notif);

        return mapToResponse(saved);
    }

    public List<ClaimResponse> getUserClaims(Long userId) {
        return claimRepository.findByClaimantIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ClaimResponse mapToResponse(Claim c) {
        return new ClaimResponse(
                c.getId(),
                c.getFoundItem().getId(),
                c.getFoundItem().getTitle(),
                c.getClaimant().getId(),
                c.getClaimant().getName(),
                c.getClaimant().getEmail(),
                c.getDescription(),
                c.getStatus(),
                c.getCreatedAt(),
                c.getReviewedAt(),
                c.getReviewerNotes(),
                c.getFinderNotes()
        );
    }
}
