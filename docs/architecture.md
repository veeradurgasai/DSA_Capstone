# Architecture Documentation - Lost & Found Intelligence System

## 1. System Overview
The Lost & Found Intelligence System is an enterprise-grade academic platform demonstrating custom Data Structures and Algorithms implemented natively in Java and exposed via Spring Boot REST APIs to a responsive React frontend.

```
+-------------------------------------------------------------+
|                      React Vite Frontend                    |
|      (HashRouter, Trie Autocomplete, Canvas Visualizer)     |
+-------------------------------------------------------------+
                              |
                              | HTTPS REST API (JSON / JWT)
                              v
+-------------------------------------------------------------+
|                  Spring Boot REST Controllers               |
|  (Auth, Lost, Found, Matches, Claims, Campus, DSA DTOs)     |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                        Service Layer                        |
|  (AuthService, ItemService, MatchingService, CampusService) |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    DSA / Algorithmic Core                   |
|  * CustomHashTable<K, V>  (Separate Chaining O(1))          |
|  * Trie                   (Prefix Autocomplete O(L))        |
|  * MaxHeap<T>             (Priority Queue Ranking O(log n)) |
|  * MergeSort              (Divide & Conquer O(n log n))     |
|  * BinarySearch           (Sorted Search O(log n))          |
|  * Graph                  (Weighted Adjacency List)         |
|  * Dijkstra               (Shortest Walking Route)          |
|  * BFS & DFS              (Graph Traversal Exploration)     |
|  * MatchingEngine         (8-Dimension Deterministic Score) |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    Spring Data JPA Layer                    |
|  (UserRepository, LostItemRepository, FoundItemRepository)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Relational Database                     |
|      (MySQL 8.0+ in Production / Embedded H2 in Dev)        |
+-------------------------------------------------------------+
```

## 2. Algorithmic Data Flow Pipeline
When a user reports a lost item, the system executes the following deterministic 12-step pipeline:

```
  1. USER SUBMITS REPORT
            |
            v
  2. DTO & BEAN VALIDATION (@NotBlank, @NotNull, Regex)
            |
            v
  3. TOKENIZATION & TEXT NORMALIZATION (KeywordProcessor)
            |
            v
  4. TRIE & KEYWORD INDEXING (O(L) insertion)
            |
            v
  5. CANDIDATE FILTERING VIA HASH MAP / STATUS PRUNING
            |
            v
  6. MULTI-DIMENSIONAL SIMILARITY EVALUATION (MatchScoreCalculator)
     - Category Match: 20 pts
     - Brand Equality: 10 pts
     - Color Equality: 15 pts
     - Keywords Overlap (Jaccard): 20 pts
     - Description Similarity (Jaccard): 10 pts
     - Campus Location Proximity (Dijkstra): 15 pts
     - Calendar Date Decay: 5 pts
     - Timestamp Decay: 5 pts
            |
            v
  7. DIJKSTRA SHORTEST PATH ON CAMPUS GRAPH (O((V + E) log V))
            |
            v
  8. SUM TOTAL SCORE (0 - 100) & HUMAN-READABLE EXPLANATION
            |
            v
  9. INSERT CANDIDATES INTO CUSTOM MAXHEAP (O(log k))
            |
            v
 10. EXTRACT TOP-5 HIGHEST CONFIDENCE MATCHES
            |
            v
 11. PERSIST MATCH RESULT RECORDS & GENERATE NOTIFICATIONS
            |
            v
 12. REACT MATCH DASHBOARD WITH SIDE-BY-SIDE SCORE BREAKDOWN
```

## 3. Security & Authentication Architecture
- **Stateless JWT**: Standard Bearer token authentication with HMAC-SHA256 signature verification.
- **BCrypt Hashing**: Passwords stored using 10-round salted BCrypt hashes. Plaintext passwords never persist.
- **Role-Based Access Control**:
  - `ROLE_STUDENT`: Permitted to report items, search, view matches, and submit claims.
  - `ROLE_ADMIN`: Restricted access to system statistics, claim adjudication, and account moderation.