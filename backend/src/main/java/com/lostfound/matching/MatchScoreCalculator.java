package com.lostfound.matching;

import com.lostfound.graph.Dijkstra;
import com.lostfound.graph.Graph;
import com.lostfound.graph.PathResult;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Deterministic 100-Point Match Score Calculator.
 *
 * Dimension Weights:
 * - Category:    20 points (Strict binary match)
 * - Brand:       10 points (Normalized string equality)
 * - Color:       15 points (Normalized string equality)
 * - Keywords:    20 points (Jaccard similarity of extracted keyword sets)
 * - Description: 10 points (Jaccard similarity of description tokens)
 * - Location:    15 points (Dijkstra graph shortest path distance tiers)
 * - Date:         5 points (Calendar day difference decay)
 * - Time:         5 points (Minute difference decay)
 * Total:        100 points
 */
public class MatchScoreCalculator {

    public static MatchBreakdown calculate(
            Long lostItemId, String lostTitle, String lostCategory, String lostBrand,
            String lostColor, String lostDesc, Long lostLocationId, LocalDate lostDate, LocalTime lostTime,
            Long foundItemId, String foundTitle, String foundCategory, String foundBrand,
            String foundColor, String foundDesc, Long foundLocationId, LocalDate foundDate, LocalTime foundTime,
            Graph campusGraph) {

        // 1. Category Score (20 pts)
        int categoryScore = 0;
        if (lostCategory != null && foundCategory != null &&
                lostCategory.trim().equalsIgnoreCase(foundCategory.trim())) {
            categoryScore = 20;
        }

        // 2. Brand Score (10 pts)
        int brandScore = 0;
        if (lostBrand != null && !lostBrand.isBlank() &&
                foundBrand != null && !foundBrand.isBlank() &&
                lostBrand.trim().equalsIgnoreCase(foundBrand.trim())) {
            brandScore = 10;
        }

        // 3. Color Score (15 pts)
        int colorScore = 0;
        if (lostColor != null && !lostColor.isBlank() &&
                foundColor != null && !foundColor.isBlank() &&
                lostColor.trim().equalsIgnoreCase(foundColor.trim())) {
            colorScore = 15;
        }

        // 4. Keyword Score (20 pts)
        Set<String> lostKeywords = KeywordProcessor.extractKeywords(lostTitle + " " + lostDesc);
        Set<String> foundKeywords = KeywordProcessor.extractKeywords(foundTitle + " " + foundDesc);
        double keywordJaccard = KeywordProcessor.computeJaccardSimilarity(lostKeywords, foundKeywords);
        int keywordScore = (int) Math.round(keywordJaccard * 20.0);

        // 5. Description Score (10 pts)
        Set<String> lostDescTokens = KeywordProcessor.extractKeywords(lostDesc);
        Set<String> foundDescTokens = KeywordProcessor.extractKeywords(foundDesc);
        double descJaccard = KeywordProcessor.computeJaccardSimilarity(lostDescTokens, foundDescTokens);
        int descriptionScore = (int) Math.round(descJaccard * 10.0);

        // 6. Location Score (15 pts) via Dijkstra
        int locationScore;
        int distanceMeters = 0;
        List<String> route = new ArrayList<>();

        if (lostLocationId == null || foundLocationId == null || campusGraph == null) {
            locationScore = 5;
            route.add("Location Unknown");
        } else if (lostLocationId.equals(foundLocationId)) {
            locationScore = 15;
            distanceMeters = 0;
            var node = campusGraph.getNode(lostLocationId);
            route.add(node != null ? node.getName() : "Same Location");
        } else {
            PathResult pathResult = Dijkstra.findShortestPath(campusGraph, lostLocationId, foundLocationId);
            distanceMeters = pathResult.getDistanceMeters();
            route = pathResult.getPathNodes();

            if (distanceMeters <= 100) {
                locationScore = 15;
            } else if (distanceMeters <= 300) {
                locationScore = 12;
            } else if (distanceMeters <= 500) {
                locationScore = 9;
            } else if (distanceMeters <= 1000) {
                locationScore = 5;
            } else {
                locationScore = 2;
            }
        }

        // 7. Date Score (5 pts)
        int dateScore = 0;
        if (lostDate != null && foundDate != null) {
            long daysApart = Math.abs(ChronoUnit.DAYS.between(lostDate, foundDate));
            if (daysApart == 0) {
                dateScore = 5;
            } else if (daysApart == 1) {
                dateScore = 3;
            } else if (daysApart == 2) {
                dateScore = 1;
            }
        }

        // 8. Time Score (5 pts)
        int timeScore = 0;
        if (lostTime != null && foundTime != null) {
            long minutesApart = Math.abs(ChronoUnit.MINUTES.between(lostTime, foundTime));
            if (minutesApart <= 30) {
                timeScore = 5;
            } else if (minutesApart <= 60) {
                timeScore = 4;
            } else if (minutesApart <= 180) {
                timeScore = 2;
            }
        }

        int totalScore = categoryScore + brandScore + colorScore + keywordScore +
                descriptionScore + locationScore + dateScore + timeScore;

        // Cap at 100
        totalScore = Math.min(100, Math.max(0, totalScore));

        // Generate explainable reason
        String reason = buildExplanation(lostTitle, foundTitle, categoryScore, brandScore,
                colorScore, locationScore, distanceMeters, totalScore);

        return new MatchBreakdown(totalScore, categoryScore, brandScore, colorScore,
                keywordScore, descriptionScore, locationScore, dateScore, timeScore,
                distanceMeters, route, reason);
    }

    private static String buildExplanation(String lostTitle, String foundTitle,
                                           int categoryScore, int brandScore, int colorScore,
                                           int locationScore, int distanceMeters, int totalScore) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Match confidence evaluated at %d%%. ", totalScore));

        if (categoryScore > 0 && brandScore > 0 && colorScore > 0) {
            sb.append("Both items share identical category, brand, and color attributes. ");
        } else if (categoryScore > 0) {
            sb.append("Items fall within the exact same category. ");
        }

        if (distanceMeters == 0) {
            sb.append("Reported at the exact same campus location. ");
        } else {
            sb.append(String.format("Locations are %d meters apart along campus path. ", distanceMeters));
        }

        return sb.toString().trim();
    }
}
