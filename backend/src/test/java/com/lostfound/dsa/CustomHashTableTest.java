package com.lostfound.dsa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CustomHashTableTest {

    private CustomHashTable<String, String> table;

    @BeforeEach
    void setUp() {
        table = new CustomHashTable<>(4); // Small initial capacity to force resizing
    }

    @Test
    @DisplayName("Basic Put and Get operations")
    void testPutAndGet() {
        table.put("electronics", "Category for digital devices");
        table.put("wallet", "Personal pocket item");

        assertEquals("Category for digital devices", table.get("electronics"));
        assertEquals("Personal pocket item", table.get("wallet"));
        assertEquals(2, table.size());
    }

    @Test
    @DisplayName("Key overwrite updates existing value")
    void testKeyOverwrite() {
        table.put("item1", "Old Value");
        assertEquals("Old Value", table.get("item1"));

        table.put("item1", "New Value");
        assertEquals("New Value", table.get("item1"));
        assertEquals(1, table.size());
    }

    @Test
    @DisplayName("Collision handling with separate chaining")
    void testCollisions() {
        // Insert keys that will populate multiple buckets and handle collisions
        table.put("keyA", "valA");
        table.put("keyB", "valB");
        table.put("keyC", "valC");
        table.put("keyD", "valD");
        table.put("keyE", "valE");

        assertEquals("valA", table.get("keyA"));
        assertEquals("valB", table.get("keyB"));
        assertEquals("valC", table.get("keyC"));
        assertEquals("valD", table.get("keyD"));
        assertEquals("valE", table.get("keyE"));
        assertTrue(table.size() >= 5);
        assertTrue(table.getCapacity() > 4, "Capacity should have resized due to load factor");
    }

    @Test
    @DisplayName("Remove key and verify size decrease")
    void testRemove() {
        table.put("phone", "iPhone 14");
        table.put("watch", "Titan");

        assertTrue(table.containsKey("phone"));
        assertEquals("iPhone 14", table.remove("phone"));
        assertFalse(table.containsKey("phone"));
        assertNull(table.get("phone"));
        assertEquals(1, table.size());

        assertNull(table.remove("nonexistent"));
    }

    @Test
    @DisplayName("Edge Case: Null key causes IllegalArgumentException")
    void testNullKey() {
        assertThrows(IllegalArgumentException.class, () -> table.put(null, "value"));
    }
}
