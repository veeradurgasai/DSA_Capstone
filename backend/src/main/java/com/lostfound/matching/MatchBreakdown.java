package com.lostfound.matching;

import java.util.List;

/**
 * Encapsulates the 8-dimension deterministic score breakdown and explanation.
 */
public class MatchBreakdown {
    private final int totalScore;
    private final int categoryScore;
    private final int brandScore;
    private final int colorScore;
    private final int keywordScore;
    private final int descriptionScore;
    private final int locationScore;
    private final int dateScore;
    private final int timeScore;
    private final int distanceMeters;
    private final List<String> route;
    private final String explanation;
    private final String matchGrade;

    public MatchBreakdown(int totalScore, int categoryScore, int brandScore, int colorScore,
                          int keywordScore, int descriptionScore, int locationScore,
                          int dateScore, int timeScore, int distanceMeters,
                          List<String> route, String explanation) {
        this.totalScore = totalScore;
        this.categoryScore = categoryScore;
        this.brandScore = brandScore;
        this.colorScore = colorScore;
        this.keywordScore = keywordScore;
        this.descriptionScore = descriptionScore;
        this.locationScore = locationScore;
        this.dateScore = dateScore;
        this.timeScore = timeScore;
        this.distanceMeters = distanceMeters;
        this.route = route;
        this.explanation = explanation;
        this.matchGrade = assignGrade(totalScore);
    }

    private String assignGrade(int score) {
        if (score >= 90) return "VERY_HIGH";
        if (score >= 75) return "HIGH";
        if (score >= 50) return "POSSIBLE";
        return "LOW";
    }

    public int getTotalScore() { return totalScore; }
    public int getCategoryScore() { return categoryScore; }
    public int getBrandScore() { return brandScore; }
    public int getColorScore() { return colorScore; }
    public int getKeywordScore() { return keywordScore; }
    public int getDescriptionScore() { return descriptionScore; }
    public int getLocationScore() { return locationScore; }
    public int getDateScore() { return dateScore; }
    public int getTimeScore() { return timeScore; }
    public int getDistanceMeters() { return distanceMeters; }
    public List<String> getRoute() { return route; }
    public String getExplanation() { return explanation; }
    public String getMatchGrade() { return matchGrade; }
}
