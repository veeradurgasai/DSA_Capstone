package com.lostfound.matching;

import java.util.*;

/**
 * Text normalization and keyword tokenization utility.
 * Applies deterministic token parsing and Jaccard similarity calculation.
 */
public class KeywordProcessor {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
            "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down",
            "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
            "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i",
            "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
            "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
            "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
            "themselves", "then", "there", "these", "they", "this", "those", "through", "to",
            "too", "under", "until", "up", "very", "was", "we", "were", "what", "when",
            "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your"
    ));

    /**
     * Normalizes text by removing punctuation, converting to lower case, and stripping stop words.
     */
    public static Set<String> extractKeywords(String text) {
        Set<String> keywords = new LinkedHashSet<>();
        if (text == null || text.isBlank()) {
            return keywords;
        }

        // Replace non-alphanumeric characters with spaces
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = cleaned.split("\\s+");

        for (String token : tokens) {
            String trimmed = token.trim();
            if (trimmed.length() >= 2 && !STOP_WORDS.contains(trimmed)) {
                keywords.add(trimmed);
            }
        }
        return keywords;
    }

    /**
     * Computes Jaccard Similarity between two keyword sets:
     * J(A, B) = |A \cap B| / |A \cup B|
     *
     * Complexity: O(|A| + |B|)
     */
    public static double computeJaccardSimilarity(Set<String> setA, Set<String> setB) {
        if (setA == null || setB == null || setA.isEmpty() || setB.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) {
            return 0.0;
        }

        return (double) intersection.size() / union.size();
    }
}
