package com.lostfound.graph;

/**
 * Node vertex representing a physical campus building/zone.
 */
public class GraphNode {
    private final Long id;
    private final String name;
    private final String description;
    private final Double latitude;
    private final Double longitude;

    public GraphNode(Long id, String name, String description, Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    @Override
    public String toString() {
        return name + " [id=" + id + "]";
    }
}
