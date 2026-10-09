package com.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ItemDTOs {

    public record LostItemRequest(
            @NotBlank(message = "Title is required")
            String title,

            @NotBlank(message = "Category is required")
            String category,

            String brand,
            String color,

            @NotBlank(message = "Description is required")
            String description,

            @NotNull(message = "Location is required")
            Long locationId,

            @NotNull(message = "Date is required")
            LocalDate lostDate,

            @NotNull(message = "Time is required")
            LocalTime lostTime,

            String imageUrl,
            List<String> keywords,
            String ownerDescription
    ) {
        public LostItemRequest(String title, String category, String brand, String color,
                               String description, Long locationId, LocalDate lostDate,
                               LocalTime lostTime, String imageUrl, List<String> keywords) {
            this(title, category, brand, color, description, locationId, lostDate, lostTime, imageUrl, keywords, null);
        }
    }

    public record FoundItemRequest(
            @NotBlank(message = "Title is required")
            String title,

            @NotBlank(message = "Category is required")
            String category,

            String brand,
            String color,

            @NotBlank(message = "Description is required")
            String description,

            @NotNull(message = "Location is required")
            Long locationId,

            @NotNull(message = "Date is required")
            LocalDate foundDate,

            @NotNull(message = "Time is required")
            LocalTime foundTime,

            String imageUrl,
            List<String> keywords,
            String handoverOption,
            String finderDescription
    ) {
        public FoundItemRequest(String title, String category, String brand, String color,
                                String description, Long locationId, LocalDate foundDate,
                                LocalTime foundTime, String imageUrl, List<String> keywords) {
            this(title, category, brand, color, description, locationId, foundDate, foundTime, imageUrl, keywords, "KEEPING_WITH_ME", null);
        }
    }

    public record ProgressUpdateRequest(
            String status, // FOUND, KEEPING_WITH_ME, HANDED_TO_OSW, HANDED_TO_LOST_PERSON, RESOLVED
            String handoverOption, // KEEPING_WITH_ME, HANDED_TO_OSW
            String finderDescription
    ) {}

    public record VerificationDetailsRequest(
            @NotBlank(message = "Identifying description is required")
            String ownerDescription
    ) {}

    public record ItemResponse(
            Long id,
            String type, // "LOST" or "FOUND"
            Long userId,
            String userName,
            String userEmail,
            String title,
            String category,
            String brand,
            String color,
            String description,
            Long locationId,
            String locationName,
            LocalDate date,
            LocalTime time,
            String status,
            String imageUrl,
            LocalDateTime createdAt,
            String handoverOption,
            String finderDescription,
            String ownerDescription
    ) {
        public ItemResponse(Long id, String type, Long userId, String userName, String userEmail,
                            String title, String category, String brand, String color,
                            String description, Long locationId, String locationName,
                            LocalDate date, LocalTime time, String status, String imageUrl,
                            LocalDateTime createdAt) {
            this(id, type, userId, userName, userEmail, title, category, brand, color,
                    description, locationId, locationName, date, time, status, imageUrl,
                    createdAt, null, null, null);
        }
    }
}
