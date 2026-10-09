package com.lostfound.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MatchDTOs {

    public record MatchResponse(
            Long id,
            Long lostItemId,
            String lostItemTitle,
            Long foundItemId,
            String foundItemTitle,
            int matchScore,
            int categoryScore,
            int brandScore,
            int colorScore,
            int keywordScore,
            int descriptionScore,
            int locationScore,
            int dateScore,
            int timeScore,
            int distanceMeters,
            List<String> route,
            String explanation,
            String matchGrade,
            LocalDateTime createdAt
    ) {}
}
