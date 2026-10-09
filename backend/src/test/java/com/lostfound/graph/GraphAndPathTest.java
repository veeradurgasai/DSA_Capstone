package com.lostfound.graph;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class GraphAndPathTest {

    private Graph graph;

    @BeforeEach
    void setUp() {
        graph = new Graph();
        graph.addNode(new GraphNode(1L, "Central Library", "Library", 12.9716, 77.5946));
        graph.addNode(new GraphNode(2L, "Main Academic Block", "Academic", 12.9725, 77.5955));
        graph.addNode(new GraphNode(3L, "CSE Block", "CSE", 12.9720, 77.5962));
        graph.addNode(new GraphNode(4L, "Hostel Block A", "Hostel", 12.9735, 77.5970));
        graph.addNode(new GraphNode(5L, "Campus Canteen", "Canteen", 12.9710, 77.5950));
        graph.addNode(new GraphNode(6L, "Isolated Pavilion", "Isolated", 12.9790, 77.5990));

        // Connect edges
        graph.addEdge(1L, 2L, 180, true);
        graph.addEdge(2L, 3L, 150, true);
        graph.addEdge(3L, 4L, 300, true);
        graph.addEdge(1L, 5L, 120, true);
    }

    @Test
    @DisplayName("Dijkstra computes optimal shortest path between Library and Hostel A")
    void testDijkstraShortestPath() {
        // Path: Library (1) -> Academic (2) [180] -> CSE (3) [150] -> Hostel A (4) [300] = 630m
        PathResult result = Dijkstra.findShortestPath(graph, 1L, 4L);

        assertTrue(result.isReachable());
        assertEquals(630, result.getDistanceMeters());
        assertEquals(List.of("Central Library", "Main Academic Block", "CSE Block", "Hostel Block A"), result.getPathNodes());
    }

    @Test
    @DisplayName("Dijkstra on identical source and target returns 0m")
    void testSameNodeDijkstra() {
        PathResult result = Dijkstra.findShortestPath(graph, 1L, 1L);
        assertEquals(0, result.getDistanceMeters());
        assertEquals(List.of("Central Library"), result.getPathNodes());
    }

    @Test
    @DisplayName("Dijkstra on disconnected node returns unreachable")
    void testDisconnectedDijkstra() {
        PathResult result = Dijkstra.findShortestPath(graph, 1L, 6L);
        assertFalse(result.isReachable());
        assertEquals(Integer.MAX_VALUE, result.getDistanceMeters());
    }

    @Test
    @DisplayName("BFS level-order traversal visits all reachable nodes")
    void testBFS() {
        BFS.TraversalResult res = BFS.traverse(graph, 1L);
        assertEquals(5, res.getNodeNames().size());
        assertEquals("Central Library", res.getNodeNames().get(0));
        assertFalse(res.getNodeNames().contains("Isolated Pavilion"));
    }

    @Test
    @DisplayName("DFS traversal visits all reachable nodes")
    void testDFS() {
        BFS.TraversalResult res = DFS.traverse(graph, 1L);
        assertEquals(5, res.getNodeNames().size());
        assertEquals("Central Library", res.getNodeNames().get(0));
        assertFalse(res.getNodeNames().contains("Isolated Pavilion"));
    }
}
