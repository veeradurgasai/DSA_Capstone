# Viva Preparation & Academic Defense Guide

This guide prepares students to explain every algorithmic and architectural decision during their B.Tech CSE project defense.

---

### Q1: Why implement a custom Trie instead of using SQL LIKE '%query%'?
**Answer**:
SQL `LIKE '%query%'` requires a full table scan of $O(N)$ row comparisons on every keystroke, which fails to scale as the database grows. Our custom `Trie.java` structures the dictionary into a character prefix tree. Querying a prefix takes $O(P + K)$ time where $P$ is the prefix length and $K$ is the number of characters in matching descendants, completely independent of the total database size $N$. This allows sub-millisecond autocomplete in the search bar.

---

### Q2: Why use a MaxHeap for ranking instead of sorting all matches?
**Answer**:
Sorting all candidates using Merge Sort takes $O(M \log M)$ time where $M$ is the number of candidates. However, the user only needs the top $K$ matches (e.g. top 5). By streaming candidate scores into our custom `MaxHeap.java`, we can extract the top $K$ items in $O(K \log M)$ time. When $K \ll M$, this provides substantial time and memory savings.

---

### Q3: Why Dijkstra's algorithm instead of Breadth-First Search (BFS) for campus distance?
**Answer**:
BFS calculates the minimum number of *hops* (edges), which works only for *unweighted* graphs. In a physical university campus, walkways between buildings vary significantly in distance (e.g. Library to Canteen is 120m, while CSE Block to Hostel A is 300m). Because our edges have positive distance weights, Dijkstra's greedy algorithm using a min-priority queue is required to compute the true minimum walking distance in $O((V + E) \log V)$ time.

---

### Q4: How does your CustomHashTable handle hash collisions?
**Answer**:
`CustomHashTable.java` employs **Separate Chaining**. Each array bucket points to the head of a linked list (`HashNode<K, V>`). When two keys hash to the same bucket index, the new node is inserted at the head of that bucket's list in $O(1)$ time. When the ratio of stored elements to capacity exceeds the 0.75 load factor threshold, the table dynamically doubles its capacity and rehashes all elements to maintain average $O(1)$ lookup performance.

---

### Q5: How is keyword and description similarity calculated without external AI APIs?
**Answer**:
We use deterministic set-theoretic **Jaccard Similarity**:
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
Input text is normalized to lowercase, stripped of punctuation, and filtered against an English stop-word set (`KeywordProcessor.java`). The resulting token sets are compared by computing the intersection count divided by the union count, scaled to our documented point weights (20 points for keywords, 10 points for description). This guarantees transparent, explainable, and reproducible results.

---

### Q6: What is the complexity of the matching pipeline?
**Answer**:
A naive Cartesian product check between $L$ lost items and $F$ found items takes $O(L \times F)$. To optimize this, our pipeline prunes candidates by category hash and active status, evaluating only relevant candidates. Scoring each candidate takes $O(\text{tokens}) + O((V + E) \log V)$ for Dijkstra. Inserting candidates into the MaxHeap takes $O(\log C)$, and extracting top-$K$ matches takes $O(K \log C)$.

---

### Q7: Why did you not use AI APIs (like OpenAI or Gemini) for matching?
**Answer**:
1. **Explainability**: Neural models are black boxes that output non-deterministic numbers without clear auditing. Our deterministic 8-dimension breakdown explicitly proves *why* an item matched (Category 20/20, Location 15/15, Date 5/5, etc.).
2. **Cost and Privacy**: External AI APIs require subscription costs and send student campus movement data to third-party cloud servers.
3. **CSE Academic Evaluation**: The core objective of this project is to demonstrate native mastery of fundamental Data Structures and Algorithms (Trie, Heap, Graphs, Hash Tables, MergeSort) implemented in Java.

---

### Q8: How is security and authentication enforced?
**Answer**:
We implemented Spring Security with stateless **JSON Web Tokens (JWT)**. Passwords are never stored in plaintext; they are hashed with salted BCrypt. Public routes allow guest searching, while reporting and claiming require authenticated student sessions. Administrative operations (`/api/admin/**`) are protected by `@PreAuthorize("hasRole('ADMIN')")` at the controller method level.