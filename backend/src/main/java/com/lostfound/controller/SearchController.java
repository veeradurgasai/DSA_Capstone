package com.lostfound.controller;

import com.lostfound.dto.ItemDTOs.ItemResponse;
import com.lostfound.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final ItemService itemService;

    public SearchController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> getAutocompleteSuggestions(@RequestParam(defaultValue = "") String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(List.of("earbuds", "laptop", "charger", "backpack", "wallet", "bottle"));
        }
        return ResponseEntity.ok(itemService.getSearchTrie().getWordsWithPrefix(q.trim().toLowerCase(), 10));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> searchAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false, defaultValue = "date") String sortBy) {

        if ("FOUND".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(itemService.getAllFoundItems(q, category, locationId, sortBy));
        } else if ("LOST".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(itemService.getAllLostItems(q, category, locationId, sortBy));
        } else {
            // Combine both
            var lost = itemService.getAllLostItems(q, category, locationId, sortBy);
            var found = itemService.getAllFoundItems(q, category, locationId, sortBy);
            var combined = new java.util.ArrayList<ItemResponse>(lost.size() + found.size());
            combined.addAll(lost);
            combined.addAll(found);
            return ResponseEntity.ok(combined);
        }
    }
}
