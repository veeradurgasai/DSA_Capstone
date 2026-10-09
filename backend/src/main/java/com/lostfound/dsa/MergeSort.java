package com.lostfound.dsa;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Custom Merge Sort Implementation with Step Tracking.
 *
 * Divide-and-Conquer Paradigm:
 * 1. Divide: Break array into halves until single-element subproblems.
 * 2. Conquer: Recursively sort each half.
 * 3. Combine: Merge two sorted sub-arrays into a single sorted array.
 *
 * Complexity Analysis:
 * - Best Case:    O(n log n)
 * - Average Case: O(n log n)
 * - Worst Case:   O(n log n)
 * - Space:        O(n) auxiliary memory for buffer
 * - Stability:    Stable (preserves relative order of equal keys)
 *
 * Project Usage:
 * - Sorting filtered lost and found item collections by date, relevance, or distance.
 * - Sorting activity logs and claim reports.
 */
public class MergeSort {

    /**
     * Sorts a list in-place using natural ordering.
     */
    public static <T extends Comparable<T>> void sort(List<T> list) {
        if (list == null || list.size() <= 1) {
            return;
        }
        sort(list, Comparator.naturalOrder());
    }

    /**
     * Sorts a list in-place using a custom comparator.
     */
    public static <T> void sort(List<T> list, Comparator<? super T> comparator) {
        if (list == null || list.size() <= 1) {
            return;
        }
        @SuppressWarnings("unchecked")
        T[] array = (T[]) list.toArray();
        @SuppressWarnings("unchecked")
        T[] temp = (T[]) new Object[array.length];
        mergeSort(array, temp, 0, array.length - 1, comparator, null);

        for (int i = 0; i < array.length; i++) {
            list.set(i, array[i]);
        }
    }

    /**
     * Sorts integer array and records steps for DSA visualizer.
     */
    public static List<String> sortWithSteps(int[] array) {
        List<String> steps = new ArrayList<>();
        if (array == null || array.length <= 1) {
            if (array != null) {
                steps.add("Initial array already sorted: " + Arrays.toString(array));
            }
            return steps;
        }

        steps.add("Initial Array: " + Arrays.toString(array));
        int[] temp = new int[array.length];
        mergeSortInt(array, temp, 0, array.length - 1, steps);
        steps.add("Final Sorted Array: " + Arrays.toString(array));
        return steps;
    }

    private static <T> void mergeSort(T[] arr, T[] temp, int left, int right, Comparator<? super T> comparator, List<String> steps) {
        if (left >= right) {
            return;
        }
        int mid = left + (right - left) / 2;
        mergeSort(arr, temp, left, mid, comparator, steps);
        mergeSort(arr, temp, mid + 1, right, comparator, steps);
        merge(arr, temp, left, mid, right, comparator);
    }

    private static <T> void merge(T[] arr, T[] temp, int left, int mid, int right, Comparator<? super T> comparator) {
        System.arraycopy(arr, left, temp, left, right - left + 1);

        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            if (comparator.compare(temp[i], temp[j]) <= 0) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }

        while (i <= mid) {
            arr[k++] = temp[i++];
        }

        while (j <= right) {
            arr[k++] = temp[j++];
        }
    }

    private static void mergeSortInt(int[] arr, int[] temp, int left, int right, List<String> steps) {
        if (left >= right) {
            return;
        }
        int mid = left + (right - left) / 2;
        steps.add(String.format("Divide: Subarray [%d..%d] into [%d..%d] and [%d..%d]", left, right, left, mid, mid + 1, right));
        
        mergeSortInt(arr, temp, left, mid, steps);
        mergeSortInt(arr, temp, mid + 1, right, steps);
        mergeInt(arr, temp, left, mid, right, steps);
    }

    private static void mergeInt(int[] arr, int[] temp, int left, int mid, int right, List<String> steps) {
        System.arraycopy(arr, left, temp, left, right - left + 1);

        int i = left;
        int j = mid + 1;
        int k = left;

        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }
        while (i <= mid) {
            arr[k++] = temp[i++];
        }
        while (j <= right) {
            arr[k++] = temp[j++];
        }

        steps.add(String.format("Merged segment [%d..%d]: %s", left, right, Arrays.toString(Arrays.copyOfRange(arr, left, right + 1))));
    }
}
