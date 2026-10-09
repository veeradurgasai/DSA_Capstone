# Lost & Found Intelligence System
### High-Performance Campus Lost Property Platform Powered by Custom Java DSA

[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Overview
The **Lost & Found Intelligence System** is an engineering capstone and Data Structures & Algorithms project designed for college campuses. Rather than a superficial CRUD database, this platform demonstrates how fundamental computer science algorithms can solve a real-world lost and found matching problem with explainable, deterministic intelligence.

Every critical feature in this system executes custom Java data structures and algorithms manually implemented from scratch:
- **Dijkstra's Algorithm** calculates physical walking distance across the campus graph.
- **Custom Trie** executes prefix search for instant search autocomplete.
- **Binary Max-Heap** ranks candidate matches by score.
- **Custom Separate-Chaining Hash Table** handles collision resolution and candidate pruning.
- **Merge Sort** orders items by date and relevance in guaranteed $O(n \log n)$ time.
- **Binary Search** provides logarithmic lookups on sorted data.

---

## 2. Problem Statement & Solution

### The Campus Problem
Traditional university lost and found boxes or social media groups suffer from:
1. **Low Discovery Rate**: Found items sit in department offices unrecognized by their owners.
2. **False Matches & Fraud**: Unverified claims lead to ownership disputes.
3. **No Spatial Awareness**: Proximity between where an item was lost and found is ignored.

### The Algorithmic Solution
Our system models the campus as a weighted graph, normalizes descriptive keywords into a Trie, and scores pairings using a deterministic 100-point model. High-confidence matches ($\ge 75\%$) automatically trigger alerts with full mathematical score breakdowns and turn-by-turn Dijkstra walking paths.

---

## 3. Technology Stack

- **Backend**: Java 17, Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Spring Security, Bean Validation, JJWT).
- **Frontend**: React 18, Vite 5, React Router 6 (HashRouter for GitHub Pages), Vanilla CSS design system.
- **Database**: MySQL 8.0+ (Production) / Embedded H2 in MySQL mode (Zero-setup local development).
- **Testing**: JUnit 5, AssertJ, Mockito (23 unit tests verifying all DSA algorithms and edge cases).
- **Deployment**: Static frontend deployed to GitHub Pages; backend deployable to Railway, Render, or Docker.

---

## 4. DSA Concepts & Feature Mapping

| Data Structure / Algorithm | Custom Java Implementation | Practical System Feature | Time Complexity |
|---|---|---|---|
| **Custom Hash Table** | `CustomHashTable.java` | In-memory candidate item and category indexing | Avg: $O(1)$, Worst: $O(n)$ |
| **Trie (Prefix Tree)** | `Trie.java`, `TrieNode.java` | Sub-millisecond keyword autocomplete in search bar | Insert/Search: $O(L)$ |
| **Binary Max-Heap** | `MaxHeap.java`, `HeapNode.java` | Priority queue ranking of potential matches (top-5) | Insert/Extract: $O(\log n)$ |
| **Merge Sort** | `MergeSort.java` | Stable sorting of search results and history | Guaranteed: $O(n \log n)$ |
| **Binary Search** | `BinarySearch.java` | Logarithmic range reduction on sorted IDs | $O(\log n)$ |
| **Campus Graph** | `Graph.java`, `Edge.java` | Adjacency list modeling of 10 campus landmarks | $O(V + E)$ |
| **Dijkstra's Algorithm** | `Dijkstra.java` | Shortest walking path & location score calculation | $O((V + E) \log V)$ |
| **BFS / DFS** | `BFS.java`, `DFS.java` | Campus zone neighborhood discovery & connectivity | $O(V + E)$ |
| **Jaccard Similarity** | `KeywordProcessor.java` | Deterministic token overlap for keywords & description | $O(|A| + |B|)$ |

---

## 5. Deterministic Matching Engine

Match probability is calculated out of 100 points across 8 distinct dimensions:

1. **Category Score (20 pts)**: Strict category equality (e.g. `Electronics` == `Electronics`).
2. **Brand Score (10 pts)**: Normalized brand comparison.
3. **Color Score (15 pts)**: Normalized color string matching.
4. **Keyword Score (20 pts)**: Jaccard similarity of extracted keyword tokens $\times 20$.
5. **Description Score (10 pts)**: Token overlap of description sentences $\times 10$.
6. **Campus Location (15 pts)**: Dijkstra shortest walking distance:
   - $0 - 100\text{m} \implies 15\text{ pts}$
   - $101 - 300\text{m} \implies 12\text{ pts}$
   - $301 - 500\text{m} \implies 9\text{ pts}$
   - $501 - 1000\text{m} \implies 5\text{ pts}$
   - $> 1000\text{m} \implies 2\text{ pts}$
7. **Date Proximity (5 pts)**: Same day = 5; 1 day apart = 3; 2 days apart = 1; else 0.
8. **Time Proximity (5 pts)**: Within 30 min = 5; within 1 hour = 4; within 3 hours = 2; else 0.

---

## 6. Repository Structure

```
lost-found-intelligence/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/lostfound/
│       │   ├── dsa/          <-- CustomHashTable, Trie, MaxHeap, MergeSort, BinarySearch
│       │   ├── graph/        <-- Graph, BFS, DFS, Dijkstra, PathResult
│       │   ├── matching/     <-- MatchingEngine, MatchScoreCalculator, KeywordProcessor
│       │   ├── entity/       <-- JPA Entities (User, LostItem, FoundItem, Location, Claim)
│       │   ├── repository/   <-- Spring Data JPA Repositories
│       │   ├── service/      <-- Item, Campus, Claim, Auth, Admin, DsaDemo services
│       │   ├── controller/   <-- REST API Controllers
│       │   ├── security/     <-- JWT Provider & Filters, UserDetailsService
│       │   └── util/         <-- DataInitializer (auto-seeds campus graph & items)
│       └── test/             <-- Comprehensive JUnit 5 Test Suite
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/       <-- Navbar, Footer, TrieAutocomplete, MatchBreakdownCard
│       ├── pages/            <-- Landing, Login, Dashboards, Map, DSA Visualizer, etc.
│       ├── services/         <-- Centralized API client reading VITE_API_URL
│       └── styles/           <-- Custom responsive CSS design system
├── database/
│   ├── schema.sql            <-- Complete MySQL 8.0 DDL with indexes & foreign keys
│   └── sample-data.sql       <-- Realistic seed dataset (10 locations, users, items)
├── docs/                     <-- Architecture, DSA, Database, API, Deployment, Viva guide
└── .github/workflows/        <-- Automated GitHub Pages deployment workflow
```

---

## 7. How to Run Locally

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- (Optional) MySQL 8.0 (Embedded H2 runs automatically if MySQL is not configured)

### 1. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.
- On initial startup, `DataInitializer` automatically seeds 10 campus locations, graph edges, demo users, sample items, and computes initial matches!
- Embedded H2 Console is available at `http://localhost:8080/h2-console` (`JDBC URL: jdbc:h2:file:./data/lostfounddb`, user: `sa`, no password).

### 2. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Demo Credentials
- **Student User**: `aarav.sharma@campus.edu` | Password: `student123`
- **Campus Admin**: `admin@campus.edu` | Password: `admin123`
*(Both login screens include one-click auto-fill buttons for evaluation)*

---

## 8. Running Automated Tests

Run the full JUnit 5 backend test suite:
```bash
cd backend
mvn test
```
All 23 test cases verify data structure invariance, Dijkstra path correctness, and matching determinism.

---

## 9. Deployment Guide

- **Frontend on GitHub Pages**: Pushing to `main` triggers `.github/workflows/frontend-deploy.yml` which builds and deploys to GitHub Pages automatically.
- **Backend on Cloud (Render / Railway)**: Build the jar using `mvn package -DskipTests` and supply environment variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS`.

---

## 10. Documentation Links
- [System Architecture](docs/architecture.md)
- [DSA Reference & Complexities](docs/dsa.md)
- [Database Schema & Indexes](docs/database.md)
- [REST API Specifications](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Suite Report](docs/testing.md)
- [Viva Defense & Q&A Preparation](docs/presentation.md)