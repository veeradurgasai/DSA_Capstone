package com.lostfound.dsa;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Custom Binary Max-Heap (Priority Queue) Implementation.
 *
 * Array Index Relationships:
 * - Parent:       (i - 1) / 2
 * - Left Child:   2 * i + 1
 * - Right Child:  2 * i + 2
 *
 * Complexity Analysis:
 * - Insert:       O(log n) via heapifyUp
 * - Extract Max:  O(log n) via heapifyDown
 * - Peek:         O(1)
 * - Heapify:      O(n)
 * - Space:        O(n)
 *
 * Project Usage:
 * - Priority ranking of candidate matches, guaranteeing that top scoring matches
 *   (e.g., 99%, 94%, 82%) are always retrieved first.
 * - Admin claim queue prioritization based on urgency.
 *
 * @param <T> Element type implementing Comparable
 */
public class MaxHeap<T extends Comparable<T>> {
    private static final int DEFAULT_CAPACITY = 16;
    private Object[] heap;
    private int size;

    public MaxHeap(int initialCapacity) {
        this.heap = new Object[Math.max(initialCapacity, DEFAULT_CAPACITY)];
        this.size = 0;
    }

    public MaxHeap() {
        this(DEFAULT_CAPACITY);
    }

    /**
     * Inserts an element and restores heap invariant using heapifyUp.
     */
    public void insert(T element) {
        if (element == null) {
            throw new IllegalArgumentException("Cannot insert null element into MaxHeap.");
        }
        ensureCapacity();
        heap[size] = element;
        heapifyUp(size);
        size++;
    }

    /**
     * Removes and returns the maximum element (root).
     */
    @SuppressWarnings("unchecked")
    public T extractMax() {
        if (isEmpty()) {
            throw new IllegalStateException("Heap is empty.");
        }
        T max = (T) heap[0];
        heap[0] = heap[size - 1];
        heap[size - 1] = null;
        size--;

        if (size > 0) {
            heapifyDown(0);
        }
        return max;
    }

    /**
     * Returns the maximum element without removing it.
     */
    @SuppressWarnings("unchecked")
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("Heap is empty.");
        }
        return (T) heap[0];
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int size() {
        return size;
    }

    /**
     * Swims element up until parent >= current.
     */
    @SuppressWarnings("unchecked")
    private void heapifyUp(int index) {
        int current = index;
        while (current > 0) {
            int parent = (current - 1) / 2;
            Comparable<T> currentVal = (Comparable<T>) heap[current];
            T parentVal = (T) heap[parent];

            if (currentVal.compareTo(parentVal) > 0) {
                swap(current, parent);
                current = parent;
            } else {
                break;
            }
        }
    }

    /**
     * Sinks element down until current >= children.
     */
    @SuppressWarnings("unchecked")
    private void heapifyDown(int index) {
        int current = index;
        while (current < size) {
            int left = 2 * current + 1;
            int right = 2 * current + 2;
            int largest = current;

            if (left < size && ((Comparable<T>) heap[left]).compareTo((T) heap[largest]) > 0) {
                largest = left;
            }

            if (right < size && ((Comparable<T>) heap[right]).compareTo((T) heap[largest]) > 0) {
                largest = right;
            }

            if (largest != current) {
                swap(current, largest);
                current = largest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        Object temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    private void ensureCapacity() {
        if (size == heap.length) {
            heap = Arrays.copyOf(heap, heap.length * 2);
        }
    }

    @SuppressWarnings("unchecked")
    public List<T> toList() {
        List<T> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add((T) heap[i]);
        }
        return list;
    }
}
