package com.lostfound.matching;

/**
 * Candidate pairing container for MaxHeap priority ordering.
 */
public class MatchCandidate implements Comparable<MatchCandidate> {
    private final Long lostItemId;
    private final Long foundItemId;
    private final MatchBreakdown breakdown;

    public MatchCandidate(Long lostItemId, Long foundItemId, MatchBreakdown breakdown) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.breakdown = breakdown;
    }

    public Long getLostItemId() {
        return lostItemId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public MatchBreakdown getBreakdown() {
        return breakdown;
    }

    @Override
    public int compareTo(MatchCandidate other) {
        // Higher total score has higher priority in MaxHeap
        int scoreCompare = Integer.compare(this.breakdown.getTotalScore(), other.breakdown.getTotalScore());
        if (scoreCompare != 0) {
            return scoreCompare;
        }
        // Tie-breaker: smaller physical distance preferred
        return Integer.compare(other.breakdown.getDistanceMeters(), this.breakdown.getDistanceMeters());
    }
}
