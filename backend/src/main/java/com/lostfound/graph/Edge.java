package com.lostfound.graph;

/**
 * Weighted edge in the campus location graph.
 */
public class Edge {
    private final Long targetLocationId;
    private final String targetName;
    private final int distanceMeters;

    public Edge(Long targetLocationId, String targetName, int distanceMeters) {
        if (distanceMeters < 0) {
            throw new IllegalArgumentException("Edge distance cannot be negative in a campus graph.");
        }
        this.targetLocationId = targetLocationId;
        this.targetName = targetName;
        this.distanceMeters = distanceMeters;
    }

    public Long getTargetLocationId() {
        return targetLocationId;
    }

    public String getTargetName() {
        return targetName;
    }

    public int getDistanceMeters() {
        return distanceMeters;
    }

    @Override
    public String toString() {
        return "Edge{to=" + targetName + " (" + targetLocationId + "), dist=" + distanceMeters + "m}";
    }
}
