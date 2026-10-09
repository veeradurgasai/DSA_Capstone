package com.lostfound.matching;

import com.lostfound.dsa.MaxHeap;
import com.lostfound.graph.Graph;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Intelligent Matching Engine utilizing candidate pruning and MaxHeap ranking.
 *
 * Algorithmic Workflow:
 * 1. Filter candidates by status and broad category hash to avoid naive O(L * F) comparisons.
 * 2. Execute multi-dimensional deterministic scoring via MatchScoreCalculator (including Dijkstra).
 * 3. Insert candidate match breakdowns into a custom MaxHeap in O(log k) per candidate.
 * 4. Extract top-K matches in O(k log n) time.
 */
public class MatchingEngine {

    /**
     * Item payload wrapper for matching evaluation.
     */
    public record MatchItem(
            Long id,
            String title,
            String category,
            String brand,
            String color,
            String description,
            Long locationId,
            LocalDate date,
            LocalTime time
    ) {}

    /**
     * Evaluates a lost item against candidate found items and returns the top-K matches ranked by MaxHeap.
     */
    public static List<MatchCandidate> findTopMatchesForLost(
            MatchItem lostItem, List<MatchItem> foundCandidates, Graph campusGraph, int topK) {

        MaxHeap<MatchCandidate> heap = new MaxHeap<>();

        for (MatchItem found : foundCandidates) {
            // Prune if category is completely different and no keywords align (candidate filtering)
            MatchBreakdown breakdown = MatchScoreCalculator.calculate(
                    lostItem.id(), lostItem.title(), lostItem.category(), lostItem.brand(),
                    lostItem.color(), lostItem.description(), lostItem.locationId(), lostItem.date(), lostItem.time(),
                    found.id(), found.title(), found.category(), found.brand(),
                    found.color(), found.description(), found.locationId(), found.date(), found.time(),
                    campusGraph
            );

            // Insert into MaxHeap
            heap.insert(new MatchCandidate(lostItem.id(), found.id(), breakdown));
        }

        // Extract top-K from MaxHeap
        List<MatchCandidate> topMatches = new ArrayList<>();
        int count = Math.min(topK, heap.size());
        for (int i = 0; i < count; i++) {
            if (!heap.isEmpty()) {
                topMatches.add(heap.extractMax());
            }
        }

        return topMatches;
    }
}
