package com.lostfound.dto;

import java.util.List;

public class GraphDTOs {

    public record CampusNodeDTO(
            Long id,
            String name,
            String description,
            Double latitude,
            Double longitude
    ) {}

    public record CampusEdgeDTO(
            Long id,
            Long sourceLocationId,
            String sourceName,
            Long targetLocationId,
            String targetName,
            int distanceMeters,
            boolean isBidirectional
    ) {}

    public record CampusGraphResponse(
            List<CampusNodeDTO> nodes,
            List<CampusEdgeDTO> edges
    ) {}

    public record ShortestPathResponse(
            Long sourceId,
            String sourceName,
            Long targetId,
            String targetName,
            int distanceMeters,
            List<String> pathNodes,
            List<Long> pathNodeIds,
            List<String> traversalSteps
    ) {}

    public record TraversalResponse(
            String algorithm,
            Long startLocationId,
            String startLocationName,
            List<String> visitedOrder,
            List<Long> visitedIds,
            List<String> steps
    ) {}
}
