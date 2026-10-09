-- ============================================================
-- Lost & Found Intelligence System - MySQL Database Schema
-- Version: 1.0.0
-- Target Engine: MySQL 8.0+ / MariaDB / H2 MySQL Mode
-- ============================================================

CREATE DATABASE IF NOT EXISTS lost_found_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lost_found_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    personal_email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_STUDENT',
    account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_account_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. LOCATIONS TABLE (Campus Graph Nodes)
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. LOCATION EDGES (Campus Graph Weighted Adjacency)
CREATE TABLE IF NOT EXISTS location_edges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_location_id BIGINT NOT NULL,
    target_location_id BIGINT NOT NULL,
    distance_meters INT NOT NULL,
    is_bidirectional BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (source_location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (target_location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_edge_source (source_location_id),
    INDEX idx_edge_target (target_location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. LOST ITEMS
CREATE TABLE IF NOT EXISTS lost_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(80),
    color VARCHAR(50),
    description TEXT NOT NULL,
    owner_description TEXT,
    location_id BIGINT NOT NULL,
    lost_date DATE NOT NULL,
    lost_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_lost_category (category),
    INDEX idx_lost_brand (brand),
    INDEX idx_lost_color (color),
    INDEX idx_lost_location (location_id),
    INDEX idx_lost_date (lost_date),
    INDEX idx_lost_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. FOUND ITEMS
CREATE TABLE IF NOT EXISTS found_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(80),
    color VARCHAR(50),
    description TEXT NOT NULL,
    handover_option VARCHAR(50) DEFAULT 'KEEPING_WITH_ME',
    finder_description TEXT,
    location_id BIGINT NOT NULL,
    found_date DATE NOT NULL,
    found_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'FOUND',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_found_category (category),
    INDEX idx_found_brand (brand),
    INDEX idx_found_color (color),
    INDEX idx_found_location (location_id),
    INDEX idx_found_date (found_date),
    INDEX idx_found_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ITEM KEYWORDS (Indexed Normalized Tokens)
CREATE TABLE IF NOT EXISTS item_keywords (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(10) NOT NULL,
    item_id BIGINT NOT NULL,
    keyword VARCHAR(80) NOT NULL,
    INDEX idx_keyword_lookup (keyword),
    INDEX idx_keyword_item (item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ITEM IMAGES
CREATE TABLE IF NOT EXISTS item_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(10) NOT NULL,
    item_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_image_item (item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. CLAIMS
CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    found_item_id BIGINT NOT NULL,
    claimant_user_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    finder_notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewer_notes VARCHAR(255),
    FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_claim_found_item (found_item_id),
    INDEX idx_claimant (claimant_user_id),
    INDEX idx_claim_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. MATCH RESULTS (Deterministic 100-pt DSA Engine Output)
CREATE TABLE IF NOT EXISTS match_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id BIGINT NOT NULL,
    found_item_id BIGINT NOT NULL,
    match_score INT NOT NULL,
    category_score INT NOT NULL,
    brand_score INT NOT NULL,
    color_score INT NOT NULL,
    keyword_score INT NOT NULL,
    description_score INT NOT NULL,
    location_score INT NOT NULL,
    date_score INT NOT NULL,
    time_score INT NOT NULL,
    distance_meters INT NOT NULL,
    route_path TEXT,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES lost_items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
    INDEX idx_match_lost (lost_item_id),
    INDEX idx_match_found (found_item_id),
    INDEX idx_match_score (match_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'MATCH',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
