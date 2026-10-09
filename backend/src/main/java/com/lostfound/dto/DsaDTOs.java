package com.lostfound.dto;

import java.util.List;

public class DsaDTOs {

    public record TrieOperationRequest(
            String word,
            String prefix
    ) {}

    public record TrieResponse(
            String operation,
            String query,
            boolean found,
            List<String> wordsWithPrefix,
            int totalWords
    ) {}

    public record HeapOperationRequest(
            Integer value
    ) {}

    public record HeapResponse(
            String operation,
            Integer value,
            List<Integer> currentHeap,
            Integer extractedMax,
            int size
    ) {}

    public record SortRequest(
            int[] numbers
    ) {}

    public record SortResponse(
            int[] original,
            int[] sorted,
            List<String> steps,
            String timeComplexity,
            String spaceComplexity
    ) {}

    public record BinarySearchRequest(
            int[] sortedNumbers,
            int target
    ) {}

    public record BinarySearchResponse(
            int target,
            int index,
            boolean found,
            List<String> steps,
            String timeComplexity
    ) {}
}
