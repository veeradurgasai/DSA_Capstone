package com.lostfound.graph;

import java.util.*;

/**
 * Adjacency List Graph for Campus Locations and Distances.
 *
 * Space Complexity: O(V + E)
 */
public class Graph {
    private final Map<Long, GraphNode> nodes;
    private final Map<Long, List<Edge>> adjacencyList;

    public Graph() {
        this.nodes = new LinkedHashMap<>();
        this.adjacencyList = new LinkedHashMap<>();
    }

    public void addNode(GraphNode node) {
        if (node != null && !nodes.containsKey(node.getId())) {
            nodes.put(node.getId(), node);
            adjacencyList.put(node.getId(), new ArrayList<>());
        }
    }

    public void addEdge(Long sourceId, Long targetId, int distanceMeters, boolean bidirectional) {
        if (!nodes.containsKey(sourceId) || !nodes.containsKey(targetId)) {
            throw new IllegalArgumentException("Both source and target locations must exist in the graph.");
        }
        GraphNode targetNode = nodes.get(targetId);
        GraphNode sourceNode = nodes.get(sourceId);

        adjacencyList.get(sourceId).add(new Edge(targetId, targetNode.getName(), distanceMeters));

        if (bidirectional) {
            adjacencyList.get(targetId).add(new Edge(sourceId, sourceNode.getName(), distanceMeters));
        }
    }

    public GraphNode getNode(Long id) {
        return nodes.get(id);
    }

    public GraphNode getNodeByName(String name) {
        if (name == null) return null;
        for (GraphNode node : nodes.values()) {
            if (node.getName().equalsIgnoreCase(name.trim())) {
                return node;
            }
        }
        return null;
    }

    public Collection<GraphNode> getAllNodes() {
        return nodes.values();
    }

    public List<Edge> getNeighbors(Long id) {
        return adjacencyList.getOrDefault(id, Collections.emptyList());
    }

    public int getNodeCount() {
        return nodes.size();
    }

    public int getEdgeCount() {
        int count = 0;
        for (List<Edge> edges : adjacencyList.values()) {
            count += edges.size();
        }
        return count;
    }

    public Map<Long, List<Edge>> getAdjacencyList() {
        return adjacencyList;
    }
}
