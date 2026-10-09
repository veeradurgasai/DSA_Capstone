# Lost & Found Intelligence System - Backend

Java 17 + Spring Boot 3.2.5 REST API backend hosting the custom DSA matching engine.

## Key Packages
- `com.lostfound.dsa`: Manual implementations of `CustomHashTable`, `Trie`, `MaxHeap`, `MergeSort`, `BinarySearch`.
- `com.lostfound.graph`: Adjacency list `Graph`, `BFS`, `DFS`, and `Dijkstra`.
- `com.lostfound.matching`: `MatchingEngine`, `MatchScoreCalculator`, `KeywordProcessor`.
- `com.lostfound.security`: Stateless JWT Bearer authentication filter.

## Build and Run
```bash
mvn test
mvn spring-boot:run
```