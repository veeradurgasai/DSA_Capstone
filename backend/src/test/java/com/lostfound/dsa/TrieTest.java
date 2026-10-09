package com.lostfound.dsa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TrieTest {

    private Trie trie;

    @BeforeEach
    void setUp() {
        trie = new Trie();
    }

    @Test
    @DisplayName("Insert and Search exact words")
    void testInsertAndSearch() {
        trie.insert("earbuds");
        trie.insert("earphones");
        trie.insert("laptop");

        assertTrue(trie.search("earbuds"));
        assertTrue(trie.search("earphones"));
        assertTrue(trie.search("laptop"));
        assertFalse(trie.search("ear"));
        assertFalse(trie.search("phone"));
    }

    @Test
    @DisplayName("Prefix Autocomplete matching")
    void testPrefixMatching() {
        trie.insert("earbuds");
        trie.insert("earphones");
        trie.insert("earpiece");
        trie.insert("early");
        trie.insert("keyboard");

        assertTrue(trie.startsWith("ear"));
        assertFalse(trie.startsWith("zoo"));

        List<String> suggestions = trie.getWordsWithPrefix("ear", 5);
        assertEquals(4, suggestions.size());
        assertTrue(suggestions.contains("earbuds"));
        assertTrue(suggestions.contains("earphones"));
        assertTrue(suggestions.contains("earpiece"));
        assertTrue(suggestions.contains("early"));
    }

    @Test
    @DisplayName("Case-insensitivity and trim normalization")
    void testNormalization() {
        trie.insert("  Sony  ");
        assertTrue(trie.search("sony"));
        assertTrue(trie.search("SONY"));
        assertTrue(trie.startsWith("SO"));
    }

    @Test
    @DisplayName("Edge Cases: Empty and duplicate words")
    void testEdgeCases() {
        trie.insert("");
        trie.insert(null);
        assertEquals(0, trie.getWordCount());

        trie.insert("apple");
        trie.insert("apple");
        assertEquals(1, trie.getWordCount());
    }
}
