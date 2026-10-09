# Database Documentation - Lost & Found Intelligence System

## Overview
The system uses a 3NF-normalized relational schema designed for MySQL 8.0+ and compatible with MariaDB and H2 (MySQL mode).

## Tables Summary

| Table Name | Primary Key | Description | Key Indexes |
|---|---|---|---|
| `users` | `id` (BIGINT) | Accounts (Admin & Students) | `email` (UNIQUE), `role` |
| `locations` | `id` (BIGINT) | Campus Graph nodes with GPS coordinates | `name` (UNIQUE) |
| `location_edges` | `id` (BIGINT) | Weighted graph edges (distance in meters) | `source_location_id`, `target_location_id` |
| `lost_items` | `id` (BIGINT) | User-reported lost items | `category`, `brand`, `color`, `location_id`, `lost_date`, `status` |
| `found_items` | `id` (BIGINT) | User-reported found items | `category`, `brand`, `color`, `location_id`, `found_date`, `status` |
| `item_keywords` | `id` (BIGINT) | Normalized keyword tokens for Trie & Hash indexing | `keyword`, `(item_type, item_id)` |
| `item_images` | `id` (BIGINT) | Item photo references | `(item_type, item_id)` |
| `claims` | `id` (BIGINT) | Ownership claim submissions & verification state | `found_item_id`, `claimant_user_id`, `status` |
| `match_results` | `id` (BIGINT) | Output of Java Matching Engine with 8-dimension breakdown | `lost_item_id`, `found_item_id`, `match_score DESC` |
| `notifications` | `id` (BIGINT) | In-app alerts for match events & claim status | `user_id`, `is_read` |
| `activity_logs` | `id` (BIGINT) | Audit trail of actions for security & analytics | `user_id`, `created_at DESC` |

## Indexing Rationale
1. **`users.email` (UNIQUE)**: Guarantees account uniqueness and enables $O(1)$ lookups during authentication.
2. **`lost_items` & `found_items` indexes (`category`, `brand`, `color`, `location_id`, `status`)**: Supports candidate pruning before running the full DSA matching pipeline, avoiding naive $O(L \times F)$ Cartesian product checks.
3. **`item_keywords.keyword`**: Accelerates exact token lookups and supports Trie population.
4. **`location_edges (source, target)`**: Enables fast adjacency-list construction for Dijkstra's shortest path and BFS/DFS graph traversals.
5. **`match_results.match_score DESC`**: Provides indexed sorting for displaying top matches.

## How to Run in MySQL
```bash
mysql -u root -p < schema.sql
mysql -u root -p < sample-data.sql
```
