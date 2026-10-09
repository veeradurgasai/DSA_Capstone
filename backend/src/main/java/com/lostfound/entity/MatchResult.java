package com.lostfound.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_results")
public class MatchResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lost_item_id", nullable = false)
    private LostItem lostItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "found_item_id", nullable = false)
    private FoundItem foundItem;

    @Column(name = "match_score", nullable = false)
    private int matchScore;

    @Column(name = "category_score", nullable = false)
    private int categoryScore;

    @Column(name = "brand_score", nullable = false)
    private int brandScore;

    @Column(name = "color_score", nullable = false)
    private int colorScore;

    @Column(name = "keyword_score", nullable = false)
    private int keywordScore;

    @Column(name = "description_score", nullable = false)
    private int descriptionScore;

    @Column(name = "location_score", nullable = false)
    private int locationScore;

    @Column(name = "date_score", nullable = false)
    private int dateScore;

    @Column(name = "time_score", nullable = false)
    private int timeScore;

    @Column(name = "distance_meters", nullable = false)
    private int distanceMeters;

    @Column(name = "route_path", columnDefinition = "TEXT")
    private String routePath;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MatchResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LostItem getLostItem() { return lostItem; }
    public void setLostItem(LostItem lostItem) { this.lostItem = lostItem; }
    public FoundItem getFoundItem() { return foundItem; }
    public void setFoundItem(FoundItem foundItem) { this.foundItem = foundItem; }
    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }
    public int getCategoryScore() { return categoryScore; }
    public void setCategoryScore(int categoryScore) { this.categoryScore = categoryScore; }
    public int getBrandScore() { return brandScore; }
    public void setBrandScore(int brandScore) { this.brandScore = brandScore; }
    public int getColorScore() { return colorScore; }
    public void setColorScore(int colorScore) { this.colorScore = colorScore; }
    public int getKeywordScore() { return keywordScore; }
    public void setKeywordScore(int keywordScore) { this.keywordScore = keywordScore; }
    public int getDescriptionScore() { return descriptionScore; }
    public void setDescriptionScore(int descriptionScore) { this.descriptionScore = descriptionScore; }
    public int getLocationScore() { return locationScore; }
    public void setLocationScore(int locationScore) { this.locationScore = locationScore; }
    public int getDateScore() { return dateScore; }
    public void setDateScore(int dateScore) { this.dateScore = dateScore; }
    public int getTimeScore() { return timeScore; }
    public void setTimeScore(int timeScore) { this.timeScore = timeScore; }
    public int getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(int distanceMeters) { this.distanceMeters = distanceMeters; }
    public String getRoutePath() { return routePath; }
    public void setRoutePath(String routePath) { this.routePath = routePath; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
