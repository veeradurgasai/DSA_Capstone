package com.lostfound.graph;

import java.util.*;

/**
 * Depth-First Search (DFS) on the Campus Graph.
 *
 * Traversal Strategy:
 * - Explores along each branch as deeply as possible before backtracking.
 *
 * Complexity Analysis:
 * - Time:  O(V + E)
 * - Space: O(V) call stack / recursion depth
 *
 * Project Usage:
 * - Campus connectivity verification.
 * - Cycle detection and comprehensive zone exploration.
 */
public class DFS {

    public static BFS.TraversalResult traverse(Graph graph, Long startLocationId) {
        List<String> visitedOrder = new ArrayList<>();
        List<Long> visitedIds = new ArrayList<>();
        List<String> steps = new ArrayList<>();

        if (graph == null || graph.getNode(startLocationId) == null) {
            steps.add("Invalid starting location ID or empty graph.");
            return new BFS.TraversalResult(visitedOrder, visitedIds, steps);
        }

        GraphNode startNode = graph.getNode(startLocationId);
        Set<Long> visited = new HashSet<>();
        steps.add(String.format("DFS Started at root node: %s (ID: %d)", startNode.getName(), startLocationId));

        dfsRecursive(graph, startLocationId, visited, visitedOrder, visitedIds, steps, 1);

        steps.add(String.format("DFS Complete. Total vertices visited: %d/%d", visitedOrder.size(), graph.getNodeCount()));
        return new BFS.TraversalResult(visitedOrder, visitedIds, steps);
    }

    private static int dfsRecursive(Graph graph, Long currentId, Set<Long> visited,
                                     List<String> visitedOrder, List<Long> visitedIds,
                                     List<String> steps, int stepCounter) {
        visited.add(currentId);
        GraphNode currentNode = graph.getNode(currentId);
        visitedOrder.add(currentNode.getName());
        visitedIds.add(currentId);

        steps.add(String.format("Step %d: Visited [%s]. Exploring deeper into adjacent edges...", stepCounter++, currentNode.getName()));

        for (Edge edge : graph.getNeighbors(currentId)) {
            Long neighborId = edge.getTargetLocationId();
            if (!visited.contains(neighborId)) {
                steps.add(String.format("  -> Advancing into branch [%s] -> [%s]", currentNode.getName(), edge.getTargetName()));
                stepCounter = dfsRecursive(graph, neighborId, visited, visitedOrder, visitedIds, steps, stepCounter);
                steps.add(String.format("  <- Backtracked to [%s]", currentNode.getName()));
            }
        }
        return stepCounter;
    }
}
