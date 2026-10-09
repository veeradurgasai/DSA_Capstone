package com.lostfound.dsa;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SortAndSearchTest {

    @Test
    @DisplayName("MergeSort correctly sorts integer arrays and lists")
    void testMergeSort() {
        List<Integer> list = new ArrayList<>(List.of(8, 3, 5, 1, 9, 2, 7, 4));
        MergeSort.sort(list);
        assertEquals(List.of(1, 2, 3, 4, 5, 7, 8, 9), list);

        int[] arr = new int[]{99, 44, 75, 12, 88};
        List<String> steps = MergeSort.sortWithSteps(arr);
        assertArrayEquals(new int[]{12, 44, 75, 88, 99}, arr);
        assertFalse(steps.isEmpty());
    }

    @Test
    @DisplayName("MergeSort edge cases: already sorted, reverse, duplicates")
    void testMergeSortEdgeCases() {
        List<Integer> sorted = new ArrayList<>(List.of(1, 2, 3));
        MergeSort.sort(sorted);
        assertEquals(List.of(1, 2, 3), sorted);

        List<Integer> reverse = new ArrayList<>(List.of(5, 4, 3, 2, 1));
        MergeSort.sort(reverse);
        assertEquals(List.of(1, 2, 3, 4, 5), reverse);

        List<Integer> dups = new ArrayList<>(List.of(3, 1, 3, 1));
        MergeSort.sort(dups);
        assertEquals(List.of(1, 1, 3, 3), dups);
    }

    @Test
    @DisplayName("BinarySearch finds target in sorted array in O(log n)")
    void testBinarySearch() {
        int[] sorted = new int[]{10, 20, 30, 40, 50, 60, 70};

        assertEquals(0, BinarySearch.search(sorted, 10));
        assertEquals(3, BinarySearch.search(sorted, 40));
        assertEquals(6, BinarySearch.search(sorted, 70));
        assertEquals(-1, BinarySearch.search(sorted, 25));
        assertEquals(-1, BinarySearch.search(sorted, 99));

        BinarySearch.SearchResult res = BinarySearch.searchWithSteps(sorted, 50);
        assertTrue(res.getIndex() == 4);
        assertFalse(res.getSteps().isEmpty());
    }
}
