package com.lostfound.dsa;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Hash Table with Separate Chaining Collision Resolution.
 *
 * Complexity Analysis:
 * - Insertion: Average O(1), Worst O(n) (when all keys collide into a single bucket)
 * - Lookup:    Average O(1), Worst O(n)
 * - Deletion:  Average O(1), Worst O(n)
 * - Space:     O(n + m) where n is entries, m is bucket capacity
 *
 * Project Usage:
 * - High-speed in-memory indexing of lost/found items by category & color.
 * - Keyword frequency counting in the text matching engine.
 *
 * @param <K> Key type
 * @param <V> Value type
 */
public class CustomHashTable<K, V> {
    private static final int DEFAULT_INITIAL_CAPACITY = 16;
    private static final float LOAD_FACTOR_THRESHOLD = 0.75f;

    private HashNode<K, V>[] buckets;
    private int capacity;
    private int size;

    @SuppressWarnings("unchecked")
    public CustomHashTable(int initialCapacity) {
        this.capacity = initialCapacity > 0 ? initialCapacity : DEFAULT_INITIAL_CAPACITY;
        this.buckets = (HashNode<K, V>[]) new HashNode[this.capacity];
        this.size = 0;
    }

    public CustomHashTable() {
        this(DEFAULT_INITIAL_CAPACITY);
    }

    /**
     * Custom polynomial rolling hash function.
     */
    private int computeHash(K key) {
        if (key == null) {
            return 0;
        }
        int h = key.hashCode();
        // High-bit mixing to reduce clustering
        h ^= (h >>> 20) ^ (h >>> 12);
        h ^= (h >>> 7) ^ (h >>> 4);
        int index = Math.abs(h) % capacity;
        return index;
    }

    /**
     * Inserts or updates a key-value pair.
     */
    public void put(K key, V value) {
        if (key == null) {
            throw new IllegalArgumentException("Null keys are not supported.");
        }

        if ((float) (size + 1) / capacity >= LOAD_FACTOR_THRESHOLD) {
            resize();
        }

        int bucketIndex = computeHash(key);
        HashNode<K, V> head = buckets[bucketIndex];

        // Search if key already exists in the linked list chain
        HashNode<K, V> current = head;
        while (current != null) {
            if (current.getKey().equals(key)) {
                current.setValue(value); // Update existing
                return;
            }
            current = current.getNext();
        }

        // Insert new node at head of chain (O(1) insertion)
        HashNode<K, V> newNode = new HashNode<>(key, value);
        newNode.setNext(head);
        buckets[bucketIndex] = newNode;
        size++;
    }

    /**
     * Retrieves the value associated with a key.
     */
    public V get(K key) {
        if (key == null) {
            return null;
        }
        int bucketIndex = computeHash(key);
        HashNode<K, V> current = buckets[bucketIndex];

        while (current != null) {
            if (current.getKey().equals(key)) {
                return current.getValue();
            }
            current = current.getNext();
        }
        return null;
    }

    /**
     * Checks if key exists.
     */
    public boolean containsKey(K key) {
        return get(key) != null;
    }

    /**
     * Removes key and returns previous value or null if not found.
     */
    public V remove(K key) {
        if (key == null) {
            return null;
        }
        int bucketIndex = computeHash(key);
        HashNode<K, V> current = buckets[bucketIndex];
        HashNode<K, V> prev = null;

        while (current != null) {
            if (current.getKey().equals(key)) {
                if (prev == null) {
                    buckets[bucketIndex] = current.getNext();
                } else {
                    prev.setNext(current.getNext());
                }
                size--;
                return current.getValue();
            }
            prev = current;
            current = current.getNext();
        }
        return null;
    }

    /**
     * Current number of key-value pairs stored.
     */
    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public int getCapacity() {
        return capacity;
    }

    /**
     * Returns list of all keys.
     */
    public List<K> keys() {
        List<K> keyList = new ArrayList<>();
        for (int i = 0; i < capacity; i++) {
            HashNode<K, V> node = buckets[i];
            while (node != null) {
                keyList.add(node.getKey());
                node = node.getNext();
            }
        }
        return keyList;
    }

    /**
     * Returns list of all values.
     */
    public List<V> values() {
        List<V> valueList = new ArrayList<>();
        for (int i = 0; i < capacity; i++) {
            HashNode<K, V> node = buckets[i];
            while (node != null) {
                valueList.add(node.getValue());
                node = node.getNext();
            }
        }
        return valueList;
    }

    /**
     * Dynamic rehashing when load factor threshold is breached.
     */
    @SuppressWarnings("unchecked")
    private void resize() {
        int newCapacity = capacity * 2;
        HashNode<K, V>[] oldBuckets = buckets;
        this.buckets = (HashNode<K, V>[]) new HashNode[newCapacity];
        this.capacity = newCapacity;
        this.size = 0;

        for (HashNode<K, V> head : oldBuckets) {
            HashNode<K, V> current = head;
            while (current != null) {
                put(current.getKey(), current.getValue());
                current = current.getNext();
            }
        }
    }

    /**
     * Clears all entries.
     */
    @SuppressWarnings("unchecked")
    public void clear() {
        this.buckets = (HashNode<K, V>[]) new HashNode[capacity];
        this.size = 0;
    }
}
