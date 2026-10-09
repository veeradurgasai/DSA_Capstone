package com.lostfound.dsa;

import java.util.HashMap;
import java.util.Map;

/**
 * Node for the custom Trie prefix tree data structure.
 */
public class TrieNode {
    private final Map<Character, TrieNode> children;
    private boolean isEndOfWord;
    private String word;
    private int frequency;

    public TrieNode() {
        this.children = new HashMap<>();
        this.isEndOfWord = false;
        this.word = null;
        this.frequency = 0;
    }

    public Map<Character, TrieNode> getChildren() {
        return children;
    }

    public boolean isEndOfWord() {
        return isEndOfWord;
    }

    public void setEndOfWord(boolean endOfWord) {
        isEndOfWord = endOfWord;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public int getFrequency() {
        return frequency;
    }

    public void incrementFrequency() {
        this.frequency++;
    }
}
