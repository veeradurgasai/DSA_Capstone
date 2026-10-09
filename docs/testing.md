# Testing Suite & Verification Report

## 1. Automated Test Architecture
The test suite utilizes **JUnit 5** and **AssertJ** to verify all custom Java Data Structures and Algorithms with high edge-case coverage.

### Summary of Executed Test Suites

| Test Class | Package | Tests Run | Failures | Status |
|---|---|---|---|---|
| `CustomHashTableTest` | `com.lostfound.dsa` | 5 | 0 | PASSED |
| `TrieTest` | `com.lostfound.dsa` | 4 | 0 | PASSED |
| `MaxHeapTest` | `com.lostfound.dsa` | 3 | 0 | PASSED |
| `SortAndSearchTest` | `com.lostfound.dsa` | 3 | 0 | PASSED |
| `GraphAndPathTest` | `com.lostfound.graph` | 5 | 0 | PASSED |
| `MatchingEngineTest` | `com.lostfound.matching` | 3 | 0 | PASSED |
| **Total** | | **23** | **0** | **100% SUCCESS** |

## 2. Tested DSA Edge Cases
1. **CustomHashTable**:
   - Dynamic rehashing when load factor breaches 0.75.
   - Separate chaining collision handling for identical hash buckets.
   - Key overwrite behavior.
   - Removal of non-existent keys.
   - Null-key validation.
2. **Trie**:
   - Prefix retrieval on empty tree and non-existent prefixes.
   - Case-insensitive search ("sony" == "SONY").
   - Duplicate word insertion without count inflation.
3. **MaxHeap**:
   - Priority queue invariance ($A[i] \ge A[2i+1]$ and $A[i] \ge A[2i+2]$).
   - Heap extraction on empty heap throwing `IllegalStateException`.
   - Handling duplicate scores.
4. **MergeSort**:
   - Already sorted array preservation.
   - Reverse-sorted array inversion.
   - Duplicate element stability.
5. **BinarySearch**:
   - Midpoint integer overflow prevention ($low + (high - low) / 2$).
   - Target absent from array returning -1.
6. **Campus Graph & Dijkstra**:
   - Shortest path verification between Central Library (1) and Hostel Block A (4) = 630 meters.
   - Identical source and target returning 0 meters.
   - Disconnected / unreachable components returning `Integer.MAX_VALUE`.
   - BFS and DFS graph traversals visiting all reachable nodes without infinite loops.
7. **Matching Engine**:
   - Deterministic 100-point scoring on Student A (Sony earbuds) & Student B matching scenario returning high confidence ($\ge 80\%$).
   - Color and category pruning for unrelated items returning low score.