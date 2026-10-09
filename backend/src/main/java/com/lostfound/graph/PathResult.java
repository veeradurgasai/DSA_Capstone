package com.lostfound.graph;

import java.util.List;

/**
 * Represents the shortest path result calculated by Dijkstra.
 */
public class PathResult {
    private final Long sourceId;
    private final String sourceName;
    private final Long targetId;
    private final String targetName;
    private final int distanceMeters;
    private final List<String> pathNodes;
    private final List<Long> pathNodeIds;
    private final List<String> traversalSteps;

    public PathResult(Long sourceId, String sourceName, Long targetId, String targetName,
                      int distanceMeters, List<String> pathNodes, List<Long> pathNodeIds,
                      List<String> traversalSteps) {
        this.sourceId = sourceId;
        this.sourceName = sourceName;
        this.targetId = targetId;
        this.targetName = targetName;
        this.distanceMeters = distanceMeters;
        this.pathNodes = pathNodes;
        this.pathNodeIds = pathNodeIds;
        this.traversalSteps = traversalSteps;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public String getSourceName() {
        return sourceName;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getTargetName() {
        return targetName;
    }

    public int getDistanceMeters() {
        return distanceMeters;
    }

    public List<String> getPathNodes() {
        return pathNodes;
    }

    public List<Long> getPathNodeIds() {
        return pathNodeIds;
    }

    public List<String> getTraversalSteps() {
        return traversalSteps;
    }

    public boolean isReachable() {
        return distanceMeters != Integer.MAX_VALUE && !pathNodes.isEmpty();
    }
}
