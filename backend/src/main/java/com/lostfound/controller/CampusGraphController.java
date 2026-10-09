package com.lostfound.controller;

import com.lostfound.dto.GraphDTOs.*;
import com.lostfound.entity.Location;
import com.lostfound.service.CampusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campus")
public class CampusGraphController {

    private final CampusService campusService;

    public CampusGraphController(CampusService campusService) {
        this.campusService = campusService;
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Location>> getLocations() {
        return ResponseEntity.ok(campusService.getAllLocations());
    }

    @GetMapping("/graph")
    public ResponseEntity<CampusGraphResponse> getCampusGraph() {
        return ResponseEntity.ok(campusService.getGraphData());
    }

    @GetMapping("/shortest-path")
    public ResponseEntity<ShortestPathResponse> getShortestPath(
            @RequestParam Long from,
            @RequestParam Long to) {
        return ResponseEntity.ok(campusService.findShortestPath(from, to));
    }

    @GetMapping("/bfs")
    public ResponseEntity<TraversalResponse> runBfs(@RequestParam Long start) {
        return ResponseEntity.ok(campusService.runBfs(start));
    }

    @GetMapping("/dfs")
    public ResponseEntity<TraversalResponse> runDfs(@RequestParam Long start) {
        return ResponseEntity.ok(campusService.runDfs(start));
    }
}
