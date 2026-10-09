package com.lostfound.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "location_edges")
public class LocationEdge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_location_id", nullable = false)
    private Location sourceLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_location_id", nullable = false)
    private Location targetLocation;

    @Column(name = "distance_meters", nullable = false)
    private int distanceMeters;

    @Column(name = "is_bidirectional")
    private boolean isBidirectional = true;

    public LocationEdge() {}

    public LocationEdge(Location sourceLocation, Location targetLocation, int distanceMeters, boolean isBidirectional) {
        this.sourceLocation = sourceLocation;
        this.targetLocation = targetLocation;
        this.distanceMeters = distanceMeters;
        this.isBidirectional = isBidirectional;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Location getSourceLocation() { return sourceLocation; }
    public void setSourceLocation(Location sourceLocation) { this.sourceLocation = sourceLocation; }
    public Location getTargetLocation() { return targetLocation; }
    public void setTargetLocation(Location targetLocation) { this.targetLocation = targetLocation; }
    public int getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(int distanceMeters) { this.distanceMeters = distanceMeters; }
    public boolean isBidirectional() { return isBidirectional; }
    public void setBidirectional(boolean bidirectional) { isBidirectional = bidirectional; }
}
