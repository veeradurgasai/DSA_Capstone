package com.lostfound.graph;

import java.util.*;

/**
 * Dijkstra's Algorithm for Finding Shortest Paths on Weighted Campus Graph.
 *
 * Invariant:
 * - At each step, select the unvisited vertex with the minimum tentative distance.
 * - Non-negative weights guarantee greedy choice correctness.
 *
 * Complexity Analysis:
 * - Time:  O((V + E) log V) using a binary min-priority queue
 * - Space: O(V + E) for distance table and predecessor pointers
 *
 * Project Usage:
 * - Computes real-world walking distance between where an item was lost and where it was found.
 * - Powers the Location dimension (15 points) of the intelligent matching engine.
 * - Generates turn-by-turn campus path navigation for students.
 */
public class Dijkstra {

    private static class DistNode implements Comparable<DistNode> {
        final Long locationId;
        final int distance;

        DistNode(Long locationId, int distance) {
            this.locationId = locationId;
            this.distance = distance;
        }

        @Override
        public int compareTo(DistNode other) {
            return Integer.compare(this.distance, other.distance);
        }
    }

    public static PathResult findShortestPath(Graph graph, Long sourceId, Long targetId) {
        List<String> steps = new ArrayList<>();

        if (graph == null) {
            throw new IllegalArgumentException("Graph cannot be null.");
        }
        GraphNode sourceNode = graph.getNode(sourceId);
        GraphNode targetNode = graph.getNode(targetId);

        if (sourceNode == null || targetNode == null) {
            steps.add("Source or target node does not exist in graph.");
            return new PathResult(sourceId, "Unknown", targetId, "Unknown", Integer.MAX_VALUE, Collections.emptyList(), Collections.emptyList(), steps);
        }

        if (sourceId.equals(targetId)) {
            steps.add(String.format("Source and target are identical (%s). Distance is 0 meters.", sourceNode.getName()));
            return new PathResult(sourceId, sourceNode.getName(), targetId, targetNode.getName(),
                    0, List.of(sourceNode.getName()), List.of(sourceId), steps);
        }

        Map<Long, Integer> distances = new HashMap<>();
        Map<Long, Long> predecessors = new HashMap<>();
        Set<Long> settled = new HashSet<>();
        PriorityQueue<DistNode> pq = new PriorityQueue<>();

        // Initialize distances to infinity
        for (GraphNode node : graph.getAllNodes()) {
            distances.put(node.getId(), Integer.MAX_VALUE);
        }

        distances.put(sourceId, 0);
        pq.add(new DistNode(sourceId, 0));
        steps.add(String.format("Dijkstra initialized: Set source [%s] dist = 0, all other nodes = \u221E", sourceNode.getName()));

        int stepNum = 1;

        while (!pq.isEmpty()) {
            DistNode current = pq.poll();
            Long u = current.locationId;

            if (settled.contains(u)) {
                continue;
            }
            settled.add(u);
            GraphNode uNode = graph.getNode(u);

            steps.add(String.format("Step %d: Settled node [%s] with current minimum distance: %dm",
                    stepNum++, uNode.getName(), current.distance));

            // Early exit if target node is settled
            if (u.equals(targetId)) {
                steps.add(String.format("Target node [%s] reached! Optimal shortest path found.", targetNode.getName()));
                break;
            }

            // Relax all outgoing edges
            for (Edge edge : graph.getNeighbors(u)) {
                Long v = edge.getTargetLocationId();
                if (settled.contains(v)) {
                    continue;
                }

                int weight = edge.getDistanceMeters();
                if (weight < 0) {
                    throw new IllegalStateException("Negative edge detected: Dijkstra does not support negative weights.");
                }

                int newDist = distances.get(u) + weight;
                if (newDist < distances.get(v)) {
                    distances.put(v, newDist);
                    predecessors.put(v, u);
                    pq.add(new DistNode(v, newDist));
                    steps.add(String.format("  -> Relax edge [%s -> %s]: distance updated from %s to %dm",
                            uNode.getName(), edge.getTargetName(),
                            (distances.get(v) == Integer.MAX_VALUE ? "\u221E" : distances.get(v) + "m"), newDist));
                }
            }
        }

        int finalDistance = distances.getOrDefault(targetId, Integer.MAX_VALUE);
        if (finalDistance == Integer.MAX_VALUE) {
            steps.add(String.format("No path exists between [%s] and [%s].", sourceNode.getName(), targetNode.getName()));
            return new PathResult(sourceId, sourceNode.getName(), targetId, targetNode.getName(),
                    Integer.MAX_VALUE, Collections.emptyList(), Collections.emptyList(), steps);
        }

        // Reconstruct path
        LinkedList<String> pathNames = new LinkedList<>();
        LinkedList<Long> pathIds = new LinkedList<>();
        Long curr = targetId;

        while (curr != null) {
            pathNames.addFirst(graph.getNode(curr).getName());
            pathIds.addFirst(curr);
            curr = predecessors.get(curr);
        }

        steps.add(String.format("Shortest Path: %s (Total Distance: %dm)", String.join(" -> ", pathNames), finalDistance));

        return new PathResult(sourceId, sourceNode.getName(), targetId, targetNode.getName(),
                finalDistance, pathNames, pathIds, steps);
    }
}
