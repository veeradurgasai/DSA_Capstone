package com.lostfound.dsa;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Trie (Prefix Tree) Implementation.
 *
 * Complexity Analysis:
 * - Insert:            O(L) where L is the length of the word
 * - Search:            O(L)
 * - Prefix Matching:   O(P + K) where P is prefix length and K is total characters in matching subtree
 * - Space:             O(N * L) where N is number of words
 *
 * Project Usage:
 * - Autocomplete keyword suggestions in item search bar (e.g. typing "ear" -> "earbuds", "earphones").
 * - Dynamic category and brand query completion.
 * - Substring token lookup for matching engine.
 */
public class Trie {
    private final TrieNode root;
    private int wordCount;

    public Trie() {
        this.root = new TrieNode();
        this.wordCount = 0;
    }

    /**
     * Inserts a word into the Trie.
     * Automatically normalizes the word to lower case and trims whitespace.
     */
    public void insert(String word) {
        if (word == null) {
            return;
        }
        String cleanWord = word.trim().toLowerCase();
        if (cleanWord.isEmpty()) {
            return;
        }

        TrieNode current = root;
        for (int i = 0; i < cleanWord.length(); i++) {
            char ch = cleanWord.charAt(i);
            current = current.getChildren().computeIfAbsent(ch, c -> new TrieNode());
        }

        if (!current.isEndOfWord()) {
            current.setEndOfWord(true);
            current.setWord(cleanWord);
            wordCount++;
        }
        current.incrementFrequency();
    }

    /**
     * Searches for exact word match.
     */
    public boolean search(String word) {
        if (word == null) {
            return false;
        }
        String cleanWord = word.trim().toLowerCase();
        if (cleanWord.isEmpty()) {
            return false;
        }

        TrieNode current = root;
        for (int i = 0; i < cleanWord.length(); i++) {
            char ch = cleanWord.charAt(i);
            current = current.getChildren().get(ch);
            if (current == null) {
                return false;
            }
        }
        return current.isEndOfWord();
    }

    /**
     * Checks if any word starts with the given prefix.
     */
    public boolean startsWith(String prefix) {
        if (prefix == null) {
            return false;
        }
        String cleanPrefix = prefix.trim().toLowerCase();
        if (cleanPrefix.isEmpty()) {
            return true;
        }

        TrieNode current = root;
        for (int i = 0; i < cleanPrefix.length(); i++) {
            char ch = cleanPrefix.charAt(i);
            current = current.getChildren().get(ch);
            if (current == null) {
                return false;
            }
        }
        return true;
    }

    /**
     * Retrieves all words with the given prefix up to maxResults.
     */
    public List<String> getWordsWithPrefix(String prefix, int maxResults) {
        List<String> results = new ArrayList<>();
        if (prefix == null) {
            return results;
        }
        String cleanPrefix = prefix.trim().toLowerCase();

        TrieNode current = root;
        for (int i = 0; i < cleanPrefix.length(); i++) {
            char ch = cleanPrefix.charAt(i);
            current = current.getChildren().get(ch);
            if (current == null) {
                return results; // Prefix not present
            }
        }

        // DFS subtree traversal to collect words
        collectWords(current, results, maxResults > 0 ? maxResults : Integer.MAX_VALUE);
        return results;
    }

    public List<String> getWordsWithPrefix(String prefix) {
        return getWordsWithPrefix(prefix, 10);
    }

    private void collectWords(TrieNode node, List<String> results, int limit) {
        if (node == null || results.size() >= limit) {
            return;
        }
        if (node.isEndOfWord()) {
            results.add(node.getWord());
        }
        for (TrieNode child : node.getChildren().values()) {
            collectWords(child, results, limit);
            if (results.size() >= limit) {
                break;
            }
        }
    }

    public int getWordCount() {
        return wordCount;
    }

    public TrieNode getRoot() {
        return root;
    }
}
