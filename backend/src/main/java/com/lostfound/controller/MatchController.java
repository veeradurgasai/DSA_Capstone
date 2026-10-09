package com.lostfound.controller;

import com.lostfound.dto.MatchDTOs.MatchResponse;
import com.lostfound.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchingService matchingService;

    public MatchController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/lost/{id}")
    public ResponseEntity<List<MatchResponse>> getMatchesForLost(@PathVariable Long id) {
        return ResponseEntity.ok(matchingService.getMatchesForLost(id));
    }

    @GetMapping("/found/{id}")
    public ResponseEntity<List<MatchResponse>> getMatchesForFound(@PathVariable Long id) {
        return ResponseEntity.ok(matchingService.getMatchesForFound(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable Long id) {
        return ResponseEntity.ok(matchingService.getMatchById(id));
    }
}
