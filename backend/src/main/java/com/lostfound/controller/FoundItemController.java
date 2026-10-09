package com.lostfound.controller;

import com.lostfound.dto.ItemDTOs.*;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/found")
public class FoundItemController {

    private final ItemService itemService;

    public FoundItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> reportFound(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FoundItemRequest request) {
        Long userId = principal != null ? principal.getId() : 3L;
        return ResponseEntity.ok(itemService.createFoundItem(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllFound(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false, defaultValue = "date") String sortBy) {
        return ResponseEntity.ok(itemService.getAllFoundItems(query, category, locationId, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getFoundById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getFoundItemById(id));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ItemResponse> resolveFound(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 3L;
        return ResponseEntity.ok(itemService.resolveFoundItem(id, userId));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ItemResponse> updateProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProgressUpdateRequest request) {
        Long userId = principal != null ? principal.getId() : 3L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(itemService.updateFoundItemProgress(id, userId, isAdmin, request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ItemResponse> cancelFound(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 3L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(itemService.cancelFoundItem(id, userId, isAdmin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFound(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 3L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        itemService.deleteFoundItem(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemResponse>> getMyFoundReports(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(itemService.getUserFoundItems(principal.getId()));
    }
}
