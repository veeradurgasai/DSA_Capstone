package com.lostfound.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "item_keywords")
public class ItemKeyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_type", nullable = false, length = 10)
    private String itemType; // 'LOST' or 'FOUND'

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false, length = 80)
    private String keyword;

    public ItemKeyword() {}

    public ItemKeyword(String itemType, Long itemId, String keyword) {
        this.itemType = itemType;
        this.itemId = itemId;
        this.keyword = keyword;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}
