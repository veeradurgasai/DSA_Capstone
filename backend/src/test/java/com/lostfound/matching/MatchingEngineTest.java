package com.lostfound.matching;

import com.lostfound.graph.Graph;
import com.lostfound.graph.GraphNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MatchingEngineTest {

    private Graph campusGraph;

    @BeforeEach
    void setUp() {
        campusGraph = new Graph();
        campusGraph.addNode(new GraphNode(1L, "Central Library", "Library", 12.9716, 77.5946));
        campusGraph.addNode(new GraphNode(2L, "CSE Block", "CSE", 12.9720, 77.5962));
        campusGraph.addEdge(1L, 2L, 250, true);
    }

    @Test
    @DisplayName("Primary Scenario: Sony earbuds produces high match (>= 80%)")
    void testPrimarySonyEarbudsScenario() {
        MatchBreakdown breakdown = MatchScoreCalculator.calculate(
                1L, "Sony Wireless Earbuds", "Electronics", "Sony", "Black",
                "Black Sony wireless earbuds inside a small black charging case. Lost near the second-floor reading section.",
                1L, LocalDate.of(2026, 10, 1), LocalTime.of(15, 0),
                2L, "Black Wireless Earbuds", "Electronics", "Sony", "Black",
                "Found black Sony earbuds in a charging case near the reading section.",
                1L, LocalDate.of(2026, 10, 1), LocalTime.of(15, 25),
                campusGraph
        );

        assertEquals(20, breakdown.getCategoryScore(), "Category match should be 20/20");
        assertEquals(10, breakdown.getBrandScore(), "Brand match should be 10/10");
        assertEquals(15, breakdown.getColorScore(), "Color match should be 15/15");
        assertEquals(15, breakdown.getLocationScore(), "Same location should be 15/15");
        assertEquals(5, breakdown.getDateScore(), "Same date should be 5/5");
        assertTrue(breakdown.getTimeScore() >= 4, "Time within 25 min should be 5/5 or 4/5");
        assertTrue(breakdown.getKeywordScore() >= 10, "Keyword score should be >= 10");
        assertTrue(breakdown.getTotalScore() >= 80, "Total score should be >= 80");
        assertTrue(List.of("HIGH", "VERY_HIGH").contains(breakdown.getMatchGrade()));
    }

    @Test
    @DisplayName("Edge Case: Different category and differing attributes produces low match (< 50%)")
    void testLowMatchScenario() {
        MatchBreakdown breakdown = MatchScoreCalculator.calculate(
                1L, "Sony Wireless Earbuds", "Electronics", "Sony", "Black",
                "Earbuds in black case",
                1L, LocalDate.of(2026, 10, 1), LocalTime.of(15, 0),
                3L, "Stainless Steel Flask", "Personal Belongings", "Milton", "Silver",
                "Silver water bottle left on desk",
                2L, LocalDate.of(2026, 9, 20), LocalTime.of(9, 0),
                campusGraph
        );

        assertEquals(0, breakdown.getCategoryScore());
        assertEquals(0, breakdown.getBrandScore());
        assertEquals(0, breakdown.getColorScore());
        assertEquals(0, breakdown.getDateScore());
        assertTrue(breakdown.getTotalScore() < 30);
        assertEquals("LOW", breakdown.getMatchGrade());
    }

    @Test
    @DisplayName("Top-K extraction ranking using MaxHeap")
    void testMatchingEngineHeapRanking() {
        MatchingEngine.MatchItem lost = new MatchingEngine.MatchItem(
                1L, "Sony Wireless Earbuds", "Electronics", "Sony", "Black",
                "Lost near reading section", 1L, LocalDate.of(2026, 10, 1), LocalTime.of(15, 0)
        );

        MatchingEngine.MatchItem foundA = new MatchingEngine.MatchItem(
                2L, "Black Wireless Earbuds", "Electronics", "Sony", "Black",
                "Found in reading section", 1L, LocalDate.of(2026, 10, 1), LocalTime.of(15, 20)
        );

        MatchingEngine.MatchItem foundB = new MatchingEngine.MatchItem(
                3L, "Dell XPS Charger", "Electronics", "Dell", "Black",
                "Charger on desk", 2L, LocalDate.of(2026, 10, 1), LocalTime.of(12, 0)
        );

        List<MatchCandidate> topMatches = MatchingEngine.findTopMatchesForLost(
                lost, List.of(foundB, foundA), campusGraph, 2
        );

        assertEquals(2, topMatches.size());
        assertEquals(2L, topMatches.get(0).getFoundItemId(), "Sony earbuds match must be first");
        assertTrue(topMatches.get(0).getBreakdown().getTotalScore() > topMatches.get(1).getBreakdown().getTotalScore());
    }
}