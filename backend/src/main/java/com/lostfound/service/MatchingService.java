package com.lostfound.service;

import com.lostfound.dto.MatchDTOs.MatchResponse;
import com.lostfound.entity.*;
import com.lostfound.matching.*;
import com.lostfound.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MatchingService {

    private final MatchResultRepository matchResultRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final NotificationRepository notificationRepository;
    private final CampusService campusService;

    public MatchingService(MatchResultRepository matchResultRepository,
                           LostItemRepository lostItemRepository,
                           FoundItemRepository foundItemRepository,
                           NotificationRepository notificationRepository,
                           CampusService campusService) {
        this.matchResultRepository = matchResultRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.notificationRepository = notificationRepository;
        this.campusService = campusService;
    }

    @Transactional
    public List<MatchCandidate> evaluateAndSaveMatchesForLost(LostItem lostItem) {
        List<FoundItem> activeFound = foundItemRepository.findByStatus("ACTIVE");
        if (activeFound.isEmpty()) {
            return List.of();
        }

        MatchingEngine.MatchItem lostWrapper = new MatchingEngine.MatchItem(
                lostItem.getId(), lostItem.getTitle(), lostItem.getCategory(), lostItem.getBrand(),
                lostItem.getColor(), lostItem.getDescription(), lostItem.getLocation().getId(),
                lostItem.getLostDate(), lostItem.getLostTime()
        );

        List<MatchingEngine.MatchItem> foundWrappers = activeFound.stream()
                .map(f -> new MatchingEngine.MatchItem(
                        f.getId(), f.getTitle(), f.getCategory(), f.getBrand(),
                        f.getColor(), f.getDescription(), f.getLocation().getId(),
                        f.getFoundDate(), f.getFoundTime()))
                .toList();

        List<MatchCandidate> topCandidates = MatchingEngine.findTopMatchesForLost(
                lostWrapper, foundWrappers, campusService.getGraph(), 5);

        for (MatchCandidate candidate : topCandidates) {
            FoundItem foundItem = foundItemRepository.findById(candidate.getFoundItemId()).orElse(null);
            if (foundItem == null) continue;

            MatchBreakdown b = candidate.getBreakdown();
            MatchResult mr = matchResultRepository.findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())
                    .orElse(new MatchResult());

            mr.setLostItem(lostItem);
            mr.setFoundItem(foundItem);
            mr.setMatchScore(b.getTotalScore());
            mr.setCategoryScore(b.getCategoryScore());
            mr.setBrandScore(b.getBrandScore());
            mr.setColorScore(b.getColorScore());
            mr.setKeywordScore(b.getKeywordScore());
            mr.setDescriptionScore(b.getDescriptionScore());
            mr.setLocationScore(b.getLocationScore());
            mr.setDateScore(b.getDateScore());
            mr.setTimeScore(b.getTimeScore());
            mr.setDistanceMeters(b.getDistanceMeters());
            mr.setRoutePath(String.join(" -> ", b.getRoute()));
            mr.setExplanation(b.getExplanation());

            matchResultRepository.save(mr);

            // Notify user if high match (>= 75%)
            if (b.getTotalScore() >= 75) {
                Notification notif = new Notification(
                        lostItem.getUser(),
                        String.format("Potential Match (%d%%) Found!", b.getTotalScore()),
                        String.format("A found item \"%s\" matches your lost \"%s\" at %s.",
                                foundItem.getTitle(), lostItem.getTitle(), foundItem.getLocation().getName()),
                        "MATCH",
                        "/matches/" + mr.getId()
                );
                notificationRepository.save(notif);
            }
        }

        return topCandidates;
    }

    @Transactional
    public List<MatchCandidate> evaluateAndSaveMatchesForFound(FoundItem foundItem) {
        List<LostItem> activeLost = lostItemRepository.findByStatus("ACTIVE");
        if (activeLost.isEmpty()) {
            return List.of();
        }

        List<MatchCandidate> allMatches = new ArrayList<>();

        for (LostItem lost : activeLost) {
            MatchingEngine.MatchItem lostWrapper = new MatchingEngine.MatchItem(
                    lost.getId(), lost.getTitle(), lost.getCategory(), lost.getBrand(),
                    lost.getColor(), lost.getDescription(), lost.getLocation().getId(),
                    lost.getLostDate(), lost.getLostTime()
            );

            MatchingEngine.MatchItem foundWrapper = new MatchingEngine.MatchItem(
                    foundItem.getId(), foundItem.getTitle(), foundItem.getCategory(), foundItem.getBrand(),
                    foundItem.getColor(), foundItem.getDescription(), foundItem.getLocation().getId(),
                    foundItem.getFoundDate(), foundItem.getFoundTime()
            );

            MatchBreakdown b = MatchScoreCalculator.calculate(
                    lostWrapper.id(), lostWrapper.title(), lostWrapper.category(), lostWrapper.brand(),
                    lostWrapper.color(), lostWrapper.description(), lostWrapper.locationId(), lostWrapper.date(), lostWrapper.time(),
                    foundWrapper.id(), foundWrapper.title(), foundWrapper.category(), foundWrapper.brand(),
                    foundWrapper.color(), foundWrapper.description(), foundWrapper.locationId(), foundWrapper.date(), foundWrapper.time(),
                    campusService.getGraph()
            );

            if (b.getTotalScore() >= 30) {
                MatchResult mr = matchResultRepository.findByLostItemIdAndFoundItemId(lost.getId(), foundItem.getId())
                        .orElse(new MatchResult());

                mr.setLostItem(lost);
                mr.setFoundItem(foundItem);
                mr.setMatchScore(b.getTotalScore());
                mr.setCategoryScore(b.getCategoryScore());
                mr.setBrandScore(b.getBrandScore());
                mr.setColorScore(b.getColorScore());
                mr.setKeywordScore(b.getKeywordScore());
                mr.setDescriptionScore(b.getDescriptionScore());
                mr.setLocationScore(b.getLocationScore());
                mr.setDateScore(b.getDateScore());
                mr.setTimeScore(b.getTimeScore());
                mr.setDistanceMeters(b.getDistanceMeters());
                mr.setRoutePath(String.join(" -> ", b.getRoute()));
                mr.setExplanation(b.getExplanation());

                matchResultRepository.save(mr);
                allMatches.add(new MatchCandidate(lost.getId(), foundItem.getId(), b));

                if (b.getTotalScore() >= 75) {
                    Notification notif = new Notification(
                            lost.getUser(),
                            String.format("Potential Match (%d%%) Found!", b.getTotalScore()),
                            String.format("A new found item \"%s\" matches your lost \"%s\".",
                                    foundItem.getTitle(), lost.getTitle()),
                            "MATCH",
                            "/matches/" + mr.getId()
                    );
                    notificationRepository.save(notif);
                }
            }
        }

        return allMatches;
    }

    public List<MatchResponse> getMatchesForLost(Long lostItemId) {
        return matchResultRepository.findByLostItemIdOrderByMatchScoreDesc(lostItemId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MatchResponse> getMatchesForFound(Long foundItemId) {
        return matchResultRepository.findByFoundItemIdOrderByMatchScoreDesc(foundItemId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MatchResponse getMatchById(Long matchId) {
        MatchResult mr = matchResultRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match result not found: " + matchId));
        return mapToResponse(mr);
    }

    private MatchResponse mapToResponse(MatchResult mr) {
        List<String> route = mr.getRoutePath() != null && !mr.getRoutePath().isBlank()
                ? List.of(mr.getRoutePath().split(" -> "))
                : List.of();

        String grade = mr.getMatchScore() >= 90 ? "VERY_HIGH" :
                       mr.getMatchScore() >= 75 ? "HIGH" :
                       mr.getMatchScore() >= 50 ? "POSSIBLE" : "LOW";

        return new MatchResponse(
                mr.getId(),
                mr.getLostItem().getId(),
                mr.getLostItem().getTitle(),
                mr.getFoundItem().getId(),
                mr.getFoundItem().getTitle(),
                mr.getMatchScore(),
                mr.getCategoryScore(),
                mr.getBrandScore(),
                mr.getColorScore(),
                mr.getKeywordScore(),
                mr.getDescriptionScore(),
                mr.getLocationScore(),
                mr.getDateScore(),
                mr.getTimeScore(),
                mr.getDistanceMeters(),
                route,
                mr.getExplanation(),
                grade,
                mr.getCreatedAt()
        );
    }
}
