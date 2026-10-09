package com.lostfound.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "found_items")
public class FoundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 80)
    private String brand;

    @Column(length = 50)
    private String color;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "found_date", nullable = false)
    private LocalDate foundDate;

    @Column(name = "found_time", nullable = false)
    private LocalTime foundTime;

    @Column(nullable = false, length = 30)
    private String status = "FOUND"; // FOUND, KEEPING_WITH_ME, HANDED_TO_OSW, HANDED_TO_LOST_PERSON, RESOLVED, ACTIVE, CANCELLED

    @Column(name = "handover_option", length = 50)
    private String handoverOption; // KEEPING_WITH_ME, HANDED_TO_OSW

    @Column(name = "finder_description", columnDefinition = "TEXT")
    private String finderDescription;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public FoundItem() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }
    public LocalDate getFoundDate() { return foundDate; }
    public void setFoundDate(LocalDate foundDate) { this.foundDate = foundDate; }
    public LocalTime getFoundTime() { return foundTime; }
    public void setFoundTime(LocalTime foundTime) { this.foundTime = foundTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getHandoverOption() { return handoverOption; }
    public void setHandoverOption(String handoverOption) { this.handoverOption = handoverOption; }
    public String getFinderDescription() { return finderDescription; }
    public void setFinderDescription(String finderDescription) { this.finderDescription = finderDescription; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
