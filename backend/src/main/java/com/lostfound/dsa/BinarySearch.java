package com.lostfound.dsa;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Binary Search Implementation with Step Tracking.
 *
 * Precondition: The input array or list MUST be sorted in ascending order.
 *
 * Complexity Analysis:
 * - Best Case:    O(1) (target is at the midpoint)
 * - Average Case: O(log n)
 * - Worst Case:   O(log n)
 * - Space:        O(1) for iterative, O(log n) stack frames for recursive
 *
 * Project Usage:
 * - Rapid lookup of sorted item IDs, timestamps, and location identifiers.
 */
public class BinarySearch {

    /**
     * Iterative binary search for an integer target in a sorted array.
     *
     * @return index of target if found, else -1
     */
    public static int search(int[] array, int target) {
        if (array == null || array.length == 0) {
            return -1;
        }

        int low = 0;
        int high = array.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2; // Prevents 32-bit integer overflow

            if (array[mid] == target) {
                return mid;
            } else if (array[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    /**
     * Binary search execution recording step-by-step state for the DSA visualizer.
     */
    public static SearchResult searchWithSteps(int[] array, int target) {
        List<String> steps = new ArrayList<>();
        if (array == null || array.length == 0) {
            steps.add("Search space is empty.");
            return new SearchResult(-1, steps);
        }

        int low = 0;
        int high = array.length - 1;
        int stepNumber = 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midVal = array[mid];

            steps.add(String.format("Step %d: Range [%d..%d], Mid Index: %d, Mid Value: %d (Target: %d)",
                    stepNumber++, low, high, mid, midVal, target));

            if (midVal == target) {
                steps.add(String.format("Target %d located at index %d!", target, mid));
                return new SearchResult(mid, steps);
            } else if (midVal < target) {
                steps.add(String.format("Mid value %d < %d -> Eliminate left half, search [%d..%d]", midVal, target, mid + 1, high));
                low = mid + 1;
            } else {
                steps.add(String.format("Mid value %d > %d -> Eliminate right half, search [%d..%d]", midVal, target, low, mid - 1));
                high = mid - 1;
            }
        }

        steps.add(String.format("Target %d not present in array.", target));
        return new SearchResult(-1, steps);
    }

    public static class SearchResult {
        private final int index;
        private final List<String> steps;

        public SearchResult(int index, List<String> steps) {
            this.index = index;
            this.steps = steps;
        }

        public int getIndex() {
            return index;
        }

        public List<String> getSteps() {
            return steps;
        }
    }
}
