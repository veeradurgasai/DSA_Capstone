# REST API Documentation

Base URL: `http://localhost:8080/api` (Production: `${VITE_API_URL}`)

## 1. Authentication Endpoints

### Register Student
- **POST** `/auth/register`
- **Body**: `{ "name": "Aarav Sharma", "email": "aarav.sharma@campus.edu", "password": "student123", "phone": "+1-555-0101" }`
- **Response**: `200 OK` with `{ "token": "...", "tokenType": "Bearer", "userId": 2, "name": "Aarav Sharma", "email": "...", "role": "ROLE_STUDENT" }`

### Login
- **POST** `/auth/login`
- **Body**: `{ "email": "aarav.sharma@campus.edu", "password": "student123" }`
- **Response**: `200 OK` with `{ "token": "...", "userId": 2, ... }`

---

## 2. Lost & Found Items

### Report Lost Item
- **POST** `/lost` (Headers: `Authorization: Bearer <token>`)
- **Body**: `{ "title": "Sony Wireless Earbuds", "category": "Electronics", "brand": "Sony", "color": "Black", "locationId": 1, "lostDate": "2026-10-01", "lostTime": "15:00:00", "description": "...", "keywords": ["black", "sony", "earbuds"] }`
- **Response**: `200 OK` (ItemResponse)

### Report Found Item
- **POST** `/found`
- **Body**: `{ "title": "Black Wireless Earbuds", "category": "Electronics", "brand": "Sony", "color": "Black", "locationId": 1, "foundDate": "2026-10-01", "foundTime": "15:25:00", "description": "..." }`
- **Response**: `200 OK`

### Search Items
- **GET** `/search?q=earbuds&type=ALL&category=Electronics&locationId=1&sortBy=date`
- **Response**: `200 OK` (List of ItemResponse sorted using custom MergeSort)

### Trie Autocomplete
- **GET** `/search/autocomplete?q=ear`
- **Response**: `200 OK` with `["earbuds", "earphones", "earpiece", "early"]`

---

## 3. Campus Graph & Shortest Path

### Campus Graph Topology
- **GET** `/campus/graph`
- **Response**: `200 OK` with `{ "nodes": [...], "edges": [...] }`

### Dijkstra Shortest Path
- **GET** `/campus/shortest-path?from=1&to=4`
- **Response**: `200 OK` with:
```json
{
  "sourceId": 1,
  "sourceName": "Central Library",
  "targetId": 4,
  "targetName": "Hostel Block A",
  "distanceMeters": 630,
  "pathNodes": ["Central Library", "Main Academic Block", "CSE Block", "Hostel Block A"],
  "pathNodeIds": [1, 2, 3, 4],
  "traversalSteps": [...]
}
```

### Graph BFS / DFS
- **GET** `/campus/bfs?start=1`
- **GET** `/campus/dfs?start=1`

---

## 4. DSA Visualizer Endpoints

- **POST** `/dsa/trie/insert` — Insert word into Trie
- **GET** `/dsa/trie/search?word=...` — Search exact word
- **GET** `/dsa/trie/prefix?prefix=...` — Autocomplete prefix query
- **POST** `/dsa/heap/insert` — Insert score into MaxHeap
- **POST** `/dsa/heap/extract` — Extract root max score
- **POST** `/dsa/sort` — Run MergeSort with step tracking
- **POST** `/dsa/binary-search` — Run Binary Search with step tracking

---

## 5. Admin Endpoints (`ROLE_ADMIN` required)

- **GET** `/admin/statistics` — Platform analytics and resolution metrics
- **GET** `/admin/users` — User management directory
- **PUT** `/admin/users/{id}/toggle-status` — Activate/Deactivate user
- **GET** `/claims` — View all submitted ownership claims
- **PUT** `/claims/{id}/review` — Approve or Reject a claim