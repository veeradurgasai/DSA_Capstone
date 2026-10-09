package com.lostfound.service;

import com.lostfound.dsa.MergeSort;
import com.lostfound.dsa.Trie;
import com.lostfound.dto.ItemDTOs.*;
import com.lostfound.entity.*;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.matching.KeywordProcessor;
import com.lostfound.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ItemService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final ItemKeywordRepository itemKeywordRepository;
    private final MatchingService matchingService;
    private final ActivityLogRepository activityLogRepository;
    private final MatchResultRepository matchResultRepository;
    private final ClaimRepository claimRepository;

    // Custom Trie for fast keyword autocomplete and search suggestions
    private final Trie searchTrie = new Trie();

    public ItemService(LostItemRepository lostItemRepository,
                       FoundItemRepository foundItemRepository,
                       LocationRepository locationRepository,
                       UserRepository userRepository,
                       ItemKeywordRepository itemKeywordRepository,
                       MatchingService matchingService,
                       ActivityLogRepository activityLogRepository,
                       MatchResultRepository matchResultRepository,
                       ClaimRepository claimRepository) {
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.itemKeywordRepository = itemKeywordRepository;
        this.matchingService = matchingService;
        this.activityLogRepository = activityLogRepository;
        this.matchResultRepository = matchResultRepository;
        this.claimRepository = claimRepository;
    }

    @PostConstruct
    public void populateTrie() {
        // Pre-populate Trie with standard categories and vocabulary
        List<String> vocab = List.of(
                "electronics", "earbuds", "earphones", "earpiece", "headphones",
                "laptop", "charger", "power bank", "adapter", "mouse", "keyboard",
                "wallet", "backpack", "bag", "calculator", "water bottle", "flask",
                "umbrella", "helmet", "glasses", "sunglasses", "spectacles", "watch",
                "smartwatch", "keys", "keychain", "jacket", "book", "textbook",
                "notebook", "id card", "phone", "smartphone", "tablet", "ipad"
        );
        for (String word : vocab) {
            searchTrie.insert(word);
        }
    }

    public Trie getSearchTrie() {
        return searchTrie;
    }

    @Transactional
    public ItemResponse createLostItem(Long userId, LostItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + request.locationId()));

        LostItem item = new LostItem();
        item.setUser(user);
        item.setTitle(request.title());
        item.setCategory(request.category());
        item.setBrand(request.brand());
        item.setColor(request.color());
        item.setDescription(request.description());
        item.setOwnerDescription(request.ownerDescription());
        item.setLocation(location);
        item.setLostDate(request.lostDate());
        item.setLostTime(request.lostTime());
        item.setImageUrl(request.imageUrl() != null && !request.imageUrl().isBlank()
                ? request.imageUrl()
                : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600");
        item.setStatus("ACTIVE");

        LostItem saved = lostItemRepository.save(item);

        // Extract and index keywords into Custom Trie
        Set<String> keywords = KeywordProcessor.extractKeywords(request.title() + " " + request.description());
        if (request.keywords() != null) {
            for (String kw : request.keywords()) {
                keywords.addAll(KeywordProcessor.extractKeywords(kw));
            }
        }
        for (String kw : keywords) {
            itemKeywordRepository.save(new ItemKeyword("LOST", saved.getId(), kw));
            searchTrie.insert(kw);
        }

        // Run matching engine against candidates
        matchingService.evaluateAndSaveMatchesForLost(saved);

        activityLogRepository.save(new ActivityLog(user, "REPORT_LOST", "Reported lost: " + saved.getTitle(), "127.0.0.1"));

        return mapToResponse(saved);
    }

    @Transactional
    public ItemResponse createFoundItem(Long userId, FoundItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + request.locationId()));

        FoundItem item = new FoundItem();
        item.setUser(user);
        item.setTitle(request.title());
        item.setCategory(request.category());
        item.setBrand(request.brand());
        item.setColor(request.color());
        item.setDescription(request.description());
        item.setLocation(location);
        item.setFoundDate(request.foundDate());
        item.setFoundTime(request.foundTime());
        item.setImageUrl(request.imageUrl() != null && !request.imageUrl().isBlank()
                ? request.imageUrl()
                : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600");

        String handoverOpt = request.handoverOption() != null && !request.handoverOption().isBlank()
                ? request.handoverOption().trim().toUpperCase() : "KEEPING_WITH_ME";
        item.setHandoverOption(handoverOpt);
        item.setFinderDescription(request.finderDescription());
        item.setStatus("HANDED_TO_OSW".equals(handoverOpt) ? "HANDED_TO_OSW" : "FOUND");

        FoundItem saved = foundItemRepository.save(item);

        // Extract and index keywords
        Set<String> keywords = KeywordProcessor.extractKeywords(request.title() + " " + request.description());
        if (request.keywords() != null) {
            for (String kw : request.keywords()) {
                keywords.addAll(KeywordProcessor.extractKeywords(kw));
            }
        }
        for (String kw : keywords) {
            itemKeywordRepository.save(new ItemKeyword("FOUND", saved.getId(), kw));
            searchTrie.insert(kw);
        }

        // Run matching engine against candidates
        matchingService.evaluateAndSaveMatchesForFound(saved);

        activityLogRepository.save(new ActivityLog(user, "REPORT_FOUND", "Reported found: " + saved.getTitle(), "127.0.0.1"));

        return mapToResponse(saved);
    }

    public List<ItemResponse> getAllLostItems(String query, String category, Long locationId, String sortBy) {
        List<LostItem> list = lostItemRepository.searchLostItems(
                (query != null && !query.isBlank()) ? query.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                locationId
        );

        List<ItemResponse> responses = new ArrayList<>(list.stream().map(this::mapToResponse).toList());

        // Apply custom MergeSort to order results
        if ("title".equalsIgnoreCase(sortBy)) {
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::title, String.CASE_INSENSITIVE_ORDER));
        } else if ("date".equalsIgnoreCase(sortBy)) {
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::date).reversed());
        } else {
            // Default newest first
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::createdAt).reversed());
        }

        return responses;
    }

    public List<ItemResponse> getAllFoundItems(String query, String category, Long locationId, String sortBy) {
        List<FoundItem> list = foundItemRepository.searchFoundItems(
                (query != null && !query.isBlank()) ? query.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                locationId
        );

        List<ItemResponse> responses = new ArrayList<>(list.stream().map(this::mapToResponse).toList());

        if ("title".equalsIgnoreCase(sortBy)) {
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::title, String.CASE_INSENSITIVE_ORDER));
        } else if ("date".equalsIgnoreCase(sortBy)) {
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::date).reversed());
        } else {
            MergeSort.sort(responses, Comparator.comparing(ItemResponse::createdAt).reversed());
        }

        return responses;
    }

    public ItemResponse getLostItemById(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found: " + id));
        return mapToResponse(item);
    }

    public ItemResponse getFoundItemById(Long id) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + id));
        return mapToResponse(item);
    }

    public List<ItemResponse> getUserLostItems(Long userId) {
        return lostItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ItemResponse> getUserFoundItems(Long userId) {
        return foundItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ItemResponse resolveLostItem(Long itemId, Long userId) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found: " + itemId));

        if (!item.getUser().getId().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            boolean isAdmin = user != null && "ROLE_ADMIN".equals(user.getRole());
            if (!isAdmin) {
                throw new BadRequestException("Unauthorized: You can only resolve your own lost reports.");
            }
        }

        item.setStatus("RESOLVED");
        return mapToResponse(lostItemRepository.save(item));
    }

    @Transactional
    public ItemResponse resolveFoundItem(Long itemId, Long userId) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + itemId));

        if (!item.getUser().getId().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            boolean isAdmin = user != null && "ROLE_ADMIN".equals(user.getRole());
            if (!isAdmin) {
                throw new BadRequestException("Unauthorized: You can only resolve your own found reports.");
            }
        }

        item.setStatus("RESOLVED");
        return mapToResponse(foundItemRepository.save(item));
    }

    @Transactional
    public ItemResponse updateFoundItemProgress(Long itemId, Long userId, boolean isAdmin, ProgressUpdateRequest request) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You can only update progress on items you reported finding.");
        }

        if (request.status() != null && !request.status().isBlank()) {
            String newStatus = request.status().trim().toUpperCase();
            validateFoundStatusTransition(item.getStatus(), newStatus);
            item.setStatus(newStatus);
        }
        if (request.handoverOption() != null && !request.handoverOption().isBlank()) {
            item.setHandoverOption(request.handoverOption().trim().toUpperCase());
        }
        if (request.finderDescription() != null) {
            item.setFinderDescription(request.finderDescription().trim());
        }

        FoundItem saved = foundItemRepository.save(item);
        activityLogRepository.save(new ActivityLog(item.getUser(), "FOUND_PROGRESS_UPDATE",
                "Updated found item #" + saved.getId() + " status to " + saved.getStatus(), "127.0.0.1"));

        return mapToResponse(saved);
    }

    private void validateFoundStatusTransition(String currentStatus, String targetStatus) {
        if (currentStatus == null || targetStatus == null) return;
        String cur = currentStatus.trim().toUpperCase();
        String target = targetStatus.trim().toUpperCase();

        if (cur.equals(target)) return;

        if ("RESOLVED".equals(cur) || "CANCELLED".equals(cur)) {
            throw new BadRequestException("Cannot update status of a " + cur + " found item.");
        }

        boolean valid = switch (cur) {
            case "FOUND", "ACTIVE" -> Set.of("KEEPING_WITH_ME", "HANDED_TO_OSW", "HANDED_TO_LOST_PERSON", "RESOLVED", "CANCELLED").contains(target);
            case "KEEPING_WITH_ME", "HANDED_TO_OSW" -> Set.of("HANDED_TO_LOST_PERSON", "RESOLVED", "CANCELLED").contains(target);
            case "HANDED_TO_LOST_PERSON" -> Set.of("RESOLVED", "CANCELLED").contains(target);
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + cur + " to " + target);
        }
    }

    @Transactional
    public ItemResponse updateLostItemVerification(Long itemId, Long userId, boolean isAdmin, VerificationDetailsRequest request) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You can only update details on items you reported.");
        }

        item.setOwnerDescription(request.ownerDescription().trim());
        LostItem saved = lostItemRepository.save(item);

        activityLogRepository.save(new ActivityLog(item.getUser(), "LOST_VERIFICATION_UPDATE",
                "Updated lost item #" + saved.getId() + " identifying details", "127.0.0.1"));

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteLostItem(Long itemId, Long userId, boolean isAdmin) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You cannot delete another student's request.");
        }

        matchResultRepository.deleteByLostItemId(itemId);
        lostItemRepository.delete(item);
    }

    @Transactional
    public void deleteFoundItem(Long itemId, Long userId, boolean isAdmin) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You cannot delete another student's request.");
        }

        matchResultRepository.deleteByFoundItemId(itemId);
        claimRepository.deleteByFoundItemId(itemId);
        foundItemRepository.delete(item);
    }

    @Transactional
    public ItemResponse cancelLostItem(Long itemId, Long userId, boolean isAdmin) {
        LostItem item = lostItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You cannot cancel another student's request.");
        }

        item.setStatus("CANCELLED");
        return mapToResponse(lostItemRepository.save(item));
    }

    @Transactional
    public ItemResponse cancelFoundItem(Long itemId, Long userId, boolean isAdmin) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found: " + itemId));

        if (!isAdmin && !item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You cannot cancel another student's request.");
        }

        item.setStatus("CANCELLED");
        return mapToResponse(foundItemRepository.save(item));
    }

    private ItemResponse mapToResponse(LostItem l) {
        return new ItemResponse(
                l.getId(), "LOST", l.getUser().getId(), l.getUser().getName(), l.getUser().getEmail(),
                l.getTitle(), l.getCategory(), l.getBrand(), l.getColor(), l.getDescription(),
                l.getLocation() != null ? l.getLocation().getId() : null,
                l.getLocation() != null ? l.getLocation().getName() : "Unknown",
                l.getLostDate(), l.getLostTime(),
                l.getStatus(), l.getImageUrl(), l.getCreatedAt(),
                null, null, l.getOwnerDescription()
        );
    }

    private ItemResponse mapToResponse(FoundItem f) {
        return new ItemResponse(
                f.getId(), "FOUND", f.getUser().getId(), f.getUser().getName(), f.getUser().getEmail(),
                f.getTitle(), f.getCategory(), f.getBrand(), f.getColor(), f.getDescription(),
                f.getLocation() != null ? f.getLocation().getId() : null,
                f.getLocation() != null ? f.getLocation().getName() : "Unknown",
                f.getFoundDate(), f.getFoundTime(),
                f.getStatus(), f.getImageUrl(), f.getCreatedAt(),
                f.getHandoverOption(), f.getFinderDescription(), null
        );
    }
}
