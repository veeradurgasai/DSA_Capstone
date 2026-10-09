package com.lostfound.graph;

import java.util.*;

/**
 * Breadth-First Search (BFS) on the Campus Graph.
 *
 * Traversal Strategy:
 * - Explores neighbors level-by-level using a First-In-First-Out (FIFO) queue.
 *
 * Complexity Analysis:
 * - Time:  O(V + E) where V is vertices (locations) and E is edges (pathways)
 * - Space: O(V) for the queue and visited set
 *
 * Project Usage:
 * - Finding nearby campus zones within k hops.
 * - Graph visualization of reachable locations.
 */
public class BFS {

    public static TraversalResult traverse(Graph graph, Long startLocationId) {
        List<String> visitedOrder = new ArrayList<>();
        List<Long> visitedIds = new ArrayList<>();
        List<String> steps = new ArrayList<>();

        if (graph == null || !graph.getAllNodes().stream().anyMatch(n -> n.getId().equals(startLocationId))) {
            steps.add("Invalid starting location ID or empty graph.");
            return new TraversalResult(visitedOrder, visitedIds, steps);
        }

        GraphNode startNode = graph.getNode(startLocationId);
        Set<Long> visited = new HashSet<>();
        Queue<Long> queue = new LinkedList<>();

        queue.add(startLocationId);
        visited.add(startLocationId);
        steps.add(String.format("BFS Started at root node: %s (ID: %d)", startNode.getName(), startLocationId));

        int stepCounter = 1;

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            GraphNode currentNode = graph.getNode(currentId);
            visitedOrder.add(currentNode.getName());
            visitedIds.add(currentId);

            steps.add(String.format("Step %d: Dequeued [%s]. Visiting adjacent unvisited neighbors...", stepCounter++, currentNode.getName()));

            for (Edge edge : graph.getNeighbors(currentId)) {
                Long neighborId = edge.getTargetLocationId();
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    queue.add(neighborId);
                    steps.add(String.format("  -> Discovered [%s] (Distance: %dm). Added to queue.", edge.getTargetName(), edge.getDistanceMeters()));
                }
            }
        }

        steps.add(String.format("BFS Complete. Total vertices visited: %d/%d", visitedOrder.size(), graph.getNodeCount()));
        return new TraversalResult(visitedOrder, visitedIds, steps);
    }

    public static class TraversalResult {
        private final List<String> nodeNames;
        private final List<Long> nodeIds;
        private final List<String> steps;

        public TraversalResult(List<String> nodeNames, List<Long> nodeIds, List<String> steps) {
            this.nodeNames = nodeNames;
            this.nodeIds = nodeIds;
            this.steps = steps;
        }

        public List<String> getNodeNames() { return nodeNames; }
        public List<Long> getNodeIds() { return nodeIds; }
        public List<String> getSteps() { return steps; }
    }
}
