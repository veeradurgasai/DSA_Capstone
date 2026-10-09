package com.lostfound.service;

import com.lostfound.dto.GraphDTOs.*;
import com.lostfound.entity.Location;
import com.lostfound.entity.LocationEdge;
import com.lostfound.graph.*;
import com.lostfound.repository.LocationEdgeRepository;
import com.lostfound.repository.LocationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CampusService {

    private final LocationRepository locationRepository;
    private final LocationEdgeRepository edgeRepository;
    private Graph campusGraph;

    public CampusService(LocationRepository locationRepository, LocationEdgeRepository edgeRepository) {
        this.locationRepository = locationRepository;
        this.edgeRepository = edgeRepository;
    }

    @PostConstruct
    public void initGraph() {
        refreshGraph();
    }

    public synchronized void refreshGraph() {
        Graph newGraph = new Graph();
        List<Location> locations = locationRepository.findAll();
        for (Location loc : locations) {
            newGraph.addNode(new GraphNode(loc.getId(), loc.getName(), loc.getDescription(), loc.getLatitude(), loc.getLongitude()));
        }

        List<LocationEdge> edges = edgeRepository.findAll();
        for (LocationEdge edge : edges) {
            newGraph.addEdge(edge.getSourceLocation().getId(), edge.getTargetLocation().getId(),
                    edge.getDistanceMeters(), edge.isBidirectional());
        }

        this.campusGraph = newGraph;
    }

    public Graph getGraph() {
        if (campusGraph == null || campusGraph.getNodeCount() == 0) {
            refreshGraph();
        }
        return campusGraph;
    }

    public CampusGraphResponse getGraphData() {
        List<CampusNodeDTO> nodes = new ArrayList<>();
        for (GraphNode node : getGraph().getAllNodes()) {
            nodes.add(new CampusNodeDTO(node.getId(), node.getName(), node.getDescription(), node.getLatitude(), node.getLongitude()));
        }

        List<CampusEdgeDTO> edges = new ArrayList<>();
        List<LocationEdge> dbEdges = edgeRepository.findAll();
        for (LocationEdge e : dbEdges) {
            edges.add(new CampusEdgeDTO(e.getId(), e.getSourceLocation().getId(), e.getSourceLocation().getName(),
                    e.getTargetLocation().getId(), e.getTargetLocation().getName(), e.getDistanceMeters(), e.isBidirectional()));
        }

        return new CampusGraphResponse(nodes, edges);
    }

    public ShortestPathResponse findShortestPath(Long sourceId, Long targetId) {
        PathResult result = Dijkstra.findShortestPath(getGraph(), sourceId, targetId);
        return new ShortestPathResponse(
                result.getSourceId(), result.getSourceName(),
                result.getTargetId(), result.getTargetName(),
                result.getDistanceMeters(), result.getPathNodes(),
                result.getPathNodeIds(), result.getTraversalSteps()
        );
    }

    public TraversalResponse runBfs(Long startLocationId) {
        Graph g = getGraph();
        GraphNode startNode = g.getNode(startLocationId);
        String name = startNode != null ? startNode.getName() : "Unknown";
        BFS.TraversalResult res = BFS.traverse(g, startLocationId);
        return new TraversalResponse("BFS", startLocationId, name, res.getNodeNames(), res.getNodeIds(), res.getSteps());
    }

    public TraversalResponse runDfs(Long startLocationId) {
        Graph g = getGraph();
        GraphNode startNode = g.getNode(startLocationId);
        String name = startNode != null ? startNode.getName() : "Unknown";
        BFS.TraversalResult res = DFS.traverse(g, startLocationId);
        return new TraversalResponse("DFS", startLocationId, name, res.getNodeNames(), res.getNodeIds(), res.getSteps());
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
}
