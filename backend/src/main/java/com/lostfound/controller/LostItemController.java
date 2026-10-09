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
@RequestMapping("/api/lost")
public class LostItemController {

    private final ItemService itemService;

    public LostItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<ItemResponse> reportLost(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LostItemRequest request) {
        Long userId = principal != null ? principal.getId() : 2L;
        return ResponseEntity.ok(itemService.createLostItem(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllLost(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false, defaultValue = "date") String sortBy) {
        return ResponseEntity.ok(itemService.getAllLostItems(query, category, locationId, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getLostById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getLostItemById(id));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ItemResponse> resolveLost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 2L;
        return ResponseEntity.ok(itemService.resolveLostItem(id, userId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ItemResponse> cancelLost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 2L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(itemService.cancelLostItem(id, userId, isAdmin));
    }

    @PutMapping("/{id}/verification-details")
    public ResponseEntity<ItemResponse> updateVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VerificationDetailsRequest request) {
        Long userId = principal != null ? principal.getId() : 2L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(itemService.updateLostItemVerification(id, userId, isAdmin, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : 2L;
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        itemService.deleteLostItem(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemResponse>> getMyLostReports(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(itemService.getUserLostItems(principal.getId()));
    }
}
