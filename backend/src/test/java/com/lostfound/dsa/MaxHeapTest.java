package com.lostfound.dsa;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MaxHeapTest {

    @Test
    @DisplayName("Insert and Extract Max maintains descending priority order")
    void testInsertAndExtractMax() {
        MaxHeap<Integer> heap = new MaxHeap<>();
        heap.insert(61);
        heap.insert(94);
        heap.insert(43);
        heap.insert(82);
        heap.insert(79);

        assertEquals(5, heap.size());
        assertEquals(94, heap.peek());

        assertEquals(94, heap.extractMax());
        assertEquals(82, heap.extractMax());
        assertEquals(79, heap.extractMax());
        assertEquals(61, heap.extractMax());
        assertEquals(43, heap.extractMax());
        assertTrue(heap.isEmpty());
    }

    @Test
    @DisplayName("Edge Case: Extract from empty heap throws exception")
    void testEmptyHeapException() {
        MaxHeap<Integer> heap = new MaxHeap<>();
        assertThrows(IllegalStateException.class, heap::extractMax);
        assertThrows(IllegalStateException.class, heap::peek);
    }

    @Test
    @DisplayName("Single element and duplicate values")
    void testDuplicatesAndSingle() {
        MaxHeap<Integer> heap = new MaxHeap<>();
        heap.insert(50);
        assertEquals(50, heap.peek());
        assertEquals(50, heap.extractMax());
        assertTrue(heap.isEmpty());

        heap.insert(80);
        heap.insert(80);
        heap.insert(80);
        assertEquals(80, heap.extractMax());
        assertEquals(80, heap.extractMax());
        assertEquals(80, heap.extractMax());
        assertTrue(heap.isEmpty());
    }
}
