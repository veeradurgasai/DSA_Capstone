package com.lostfound.controller;

import com.lostfound.dto.DsaDTOs.*;
import com.lostfound.service.DsaDemoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dsa")
public class DsaVisualizerController {

    private final DsaDemoService dsaService;

    public DsaVisualizerController(DsaDemoService dsaService) {
        this.dsaService = dsaService;
    }

    @PostMapping("/trie/insert")
    public ResponseEntity<TrieResponse> insertTrieWord(@RequestBody TrieOperationRequest request) {
        return ResponseEntity.ok(dsaService.insertTrieWord(request.word()));
    }

    @GetMapping("/trie/search")
    public ResponseEntity<TrieResponse> searchTrieWord(@RequestParam String word) {
        return ResponseEntity.ok(dsaService.searchTrieWord(word));
    }

    @GetMapping("/trie/prefix")
    public ResponseEntity<TrieResponse> getTriePrefix(@RequestParam String prefix) {
        return ResponseEntity.ok(dsaService.getWordsWithPrefix(prefix));
    }

    @PostMapping("/heap/insert")
    public ResponseEntity<HeapResponse> insertHeap(@RequestBody HeapOperationRequest request) {
        return ResponseEntity.ok(dsaService.insertHeap(request.value()));
    }

    @PostMapping("/heap/extract")
    public ResponseEntity<HeapResponse> extractMaxHeap() {
        return ResponseEntity.ok(dsaService.extractMaxHeap());
    }

    @GetMapping("/heap")
    public ResponseEntity<HeapResponse> getHeap() {
        return ResponseEntity.ok(dsaService.getHeapState());
    }

    @PostMapping("/sort")
    public ResponseEntity<SortResponse> runMergeSort(@RequestBody SortRequest request) {
        int[] nums = request.numbers() != null ? request.numbers() : new int[]{8, 3, 5, 1, 9, 2, 7, 4};
        return ResponseEntity.ok(dsaService.runMergeSort(nums));
    }

    @PostMapping("/binary-search")
    public ResponseEntity<BinarySearchResponse> runBinarySearch(@RequestBody BinarySearchRequest request) {
        int[] nums = request.sortedNumbers() != null ? request.sortedNumbers() : new int[]{1, 2, 3, 4, 5, 7, 8, 9};
        return ResponseEntity.ok(dsaService.runBinarySearch(nums, request.target()));
    }
}
