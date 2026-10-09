# Data Structures and Algorithms Reference

This document details the exact complexity, implementation design, and functional role of every custom Java DSA structure in the Lost & Found Intelligence System.

## 1. Algorithmic Complexity Table

| Algorithm / Data Structure | Primary Java Class | Purpose in System | Time Complexity | Space Complexity |
|---|---|---|---|---|
| **Custom Hash Table** | `CustomHashTable<K, V>` | In-memory category and token indexing | Average: $O(1)$<br>Worst: $O(n)$ | $O(n + m)$ |
| **Trie (Prefix Tree)** | `Trie.java`, `TrieNode.java` | Real-time search keyword autocomplete | Insert: $O(L)$<br>Search: $O(L)$<br>Prefix: $O(P + K)$ | $O(N \cdot L)$ |
| **Binary Max-Heap** | `MaxHeap.java`, `HeapNode.java` | Priority ranking of top candidate matches | Insert: $O(\log n)$<br>ExtractMax: $O(\log n)$<br>Peek: $O(1)$ | $O(n)$ |
| **Merge Sort** | `MergeSort.java` | Stable sorting of search results & history | Best: $O(n \log n)$<br>Avg: $O(n \log n)$<br>Worst: $O(n \log n)$ | $O(n)$ |
| **Binary Search** | `BinarySearch.java` | Logarithmic lookup on sorted IDs | Best: $O(1)$<br>Avg: $O(\log n)$<br>Worst: $O(\log n)$ | $O(1)$ |
| **Campus Graph** | `Graph.java`, `Edge.java` | Spatial modeling of campus buildings | Neighbors: $O(\text{deg}(v))$ | $O(V + E)$ |
| **BFS** | `BFS.java` | Level-order discovery of nearby locations | $O(V + E)$ | $O(V)$ |
| **DFS** | `DFS.java` | Campus connectivity and cycle detection | $O(V + E)$ | $O(V)$ |
| **Dijkstra's Algorithm** | `Dijkstra.java` | Shortest physical walking route in meters | $O((V + E) \log V)$ | $O(V + E)$ |
| **Jaccard Similarity** | `KeywordProcessor.java` | Token overlap for keywords & description | $O(|A| + |B|)$ | $O(|A| + |B|)$ |

## 2. DSA to Feature Mapping

```
Array / Dynamic Array  --> Heap buffer and score dimension weights
String Processing      --> Normalization, trimming, lowercasing, stop-word removal
Linked List Node       --> Hash table separate chaining buckets
Hash Table             --> Rapid in-memory category item bucket lookups
HashSet                --> Unique keyword set deduplication
Trie                   --> Real-time search bar autocomplete suggestions
Binary Max Heap        --> Priority ranking of matching candidates (top-5 extraction)
Merge Sort             --> Result ordering by date, title, and relevance
Binary Search          --> Fast location ID and record indexing
Campus Graph           --> Physical network of 10 campus zones and walkways
BFS Traversal          --> Neighborhood discovery around where an item was lost
DFS Traversal          --> Campus zone reachability check
Dijkstra               --> Walking distance calculation for location proximity score (15 pts)
Greedy Logic           --> Candidate match scoring and thresholding
```