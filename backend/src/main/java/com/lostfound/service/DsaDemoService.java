package com.lostfound.service;

import com.lostfound.dsa.BinarySearch;
import com.lostfound.dsa.MaxHeap;
import com.lostfound.dsa.MergeSort;
import com.lostfound.dsa.Trie;
import com.lostfound.dto.DsaDTOs.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class DsaDemoService {

    private final Trie demoTrie = new Trie();
    private final MaxHeap<Integer> demoHeap = new MaxHeap<>();

    public DsaDemoService() {
        // Seed default words for interactive demo
        List.of("earbuds", "earphones", "earpiece", "charger", "laptop", "backpack", "wallet", "watch", "waterbottle")
                .forEach(demoTrie::insert);

        // Seed default numbers for heap demo
        List.of(94, 82, 79, 61, 43).forEach(demoHeap::insert);
    }

    public TrieResponse insertTrieWord(String word) {
        demoTrie.insert(word);
        return new TrieResponse("INSERT", word, true, demoTrie.getWordsWithPrefix(word), demoTrie.getWordCount());
    }

    public TrieResponse searchTrieWord(String word) {
        boolean found = demoTrie.search(word);
        return new TrieResponse("SEARCH", word, found, List.of(), demoTrie.getWordCount());
    }

    public TrieResponse getWordsWithPrefix(String prefix) {
        List<String> matches = demoTrie.getWordsWithPrefix(prefix);
        return new TrieResponse("PREFIX", prefix, !matches.isEmpty(), matches, demoTrie.getWordCount());
    }

    public HeapResponse insertHeap(Integer val) {
        demoHeap.insert(val);
        return new HeapResponse("INSERT", val, demoHeap.toList(), null, demoHeap.size());
    }

    public HeapResponse extractMaxHeap() {
        if (demoHeap.isEmpty()) {
            return new HeapResponse("EXTRACT_MAX", null, List.of(), null, 0);
        }
        Integer max = demoHeap.extractMax();
        return new HeapResponse("EXTRACT_MAX", max, demoHeap.toList(), max, demoHeap.size());
    }

    public HeapResponse getHeapState() {
        return new HeapResponse("PEEK", demoHeap.isEmpty() ? null : demoHeap.peek(), demoHeap.toList(), null, demoHeap.size());
    }

    public SortResponse runMergeSort(int[] input) {
        int[] copy = Arrays.copyOf(input, input.length);
        List<String> steps = MergeSort.sortWithSteps(copy);
        return new SortResponse(input, copy, steps, "O(n log n)", "O(n)");
    }

    public BinarySearchResponse runBinarySearch(int[] sortedArray, int target) {
        BinarySearch.SearchResult result = BinarySearch.searchWithSteps(sortedArray, target);
        return new BinarySearchResponse(target, result.getIndex(), result.getIndex() != -1, result.getSteps(), "O(log n)");
    }
}
