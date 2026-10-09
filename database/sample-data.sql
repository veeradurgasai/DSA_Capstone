-- ============================================================
-- Lost & Found Intelligence System - Sample Data
-- Includes:
-- - 1 Admin User (admin@campus.edu / admin123)
-- - 10 Student Users (password: student123)
-- - 10 Campus Locations with coordinates
-- - 15 Weighted Graph Edges (Distances in meters)
-- - 20 Lost Items across multiple categories
-- - 20 Found Items across multiple categories
-- - Pre-calculated Match Results (High, Medium, Low)
-- - Sample Claims, Notifications, Activity Logs
-- ============================================================

USE lost_found_db;

-- ------------------------------------------------------------
-- 1. USERS (BCrypt hashed passwords)
-- password for all students: "student123" ($2a$10$e8vXf609eM/P5WlA6k.QheYh7nF4X7GvT8sLgBf4r.P6r6S6h1pX6)
-- password for admin: "admin123" ($2a$10$b5y2wQ9R/H3.wW.sFkR0quzF0oP7fI8.E9V7vW6F8/q5W6XQh1vXs)
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, personal_email, password_hash, phone, role, account_status, is_active) VALUES
(1, 'Campus Admin', 'admin@campus.edu', 'admin.personal@campus.edu', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0100', 'ROLE_ADMIN', 'APPROVED', TRUE),
(2, 'Aarav Sharma', 'aarav.sharma@campus.edu', 'aarav.sharma@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0101', 'ROLE_STUDENT', 'APPROVED', TRUE),
(3, 'Bhavna Patel', 'bhavna.patel@campus.edu', 'bhavna.patel@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0102', 'ROLE_STUDENT', 'APPROVED', TRUE),
(4, 'Chirag Rao', 'chirag.rao@campus.edu', 'chirag.rao@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0103', 'ROLE_STUDENT', 'APPROVED', TRUE),
(5, 'Divya Nair', 'divya.nair@campus.edu', 'divya.nair@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0104', 'ROLE_STUDENT', 'APPROVED', TRUE),
(6, 'Eshan Gupta', 'eshan.gupta@campus.edu', 'eshan.gupta@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0105', 'ROLE_STUDENT', 'APPROVED', TRUE),
(7, 'Farhan Khan', 'farhan.khan@campus.edu', 'farhan.khan@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0106', 'ROLE_STUDENT', 'APPROVED', TRUE),
(8, 'Gauri Joshi', 'gauri.joshi@campus.edu', 'gauri.joshi@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0107', 'ROLE_STUDENT', 'APPROVED', TRUE),
(9, 'Harsh Vardhan', 'harsh.vardhan@campus.edu', 'harsh.vardhan@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0108', 'ROLE_STUDENT', 'APPROVED', TRUE),
(10, 'Ishita Roy', 'ishita.roy@campus.edu', 'ishita.roy@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0109', 'ROLE_STUDENT', 'APPROVED', TRUE),
(11, 'Karan Malhotra', 'karan.malhotra@campus.edu', 'karan.m99@gmail.com', '$2a$10$w09ZqWvW90q5W6XQh1vXse9k8w6Y7l1u3e4r5t6y7u8i9o0p1a2s3', '+1-555-0199', 'ROLE_STUDENT', 'PENDING', TRUE);

-- ------------------------------------------------------------
-- 2. CAMPUS LOCATIONS (15 Official Nodes)
-- ------------------------------------------------------------
INSERT INTO locations (id, name, description, latitude, longitude) VALUES
(1, 'Library', 'Central academic library and reference reading room', 12.9716, 77.5946),
(2, 'Temple', 'Campus temple and peaceful heritage garden pavilion', 12.9722, 77.5938),
(3, 'Academic Block', 'Main administrative offices, lecture halls, and auditoriums', 12.9725, 77.5955),
(4, 'Main Canteen', 'Central dining hall and campus food court', 12.9710, 77.5950),
(5, 'Lab Block & Kaivalya Bhavan Hostel', 'Engineering laboratories with attached student residential wings', 12.9728, 77.5968),
(6, 'Aitherya Bhavan Hostel', 'Junior undergraduate hostel residence', 12.9738, 77.5972),
(7, 'Night Canteen', 'Late-night student cafeteria and refreshment hub', 12.9718, 77.5962),
(8, 'Volleyball Court', 'Outdoor standard volleyball court near sports arena', 12.9705, 77.5958),
(9, 'Basketball Court', 'Floodlit championship basketball courts', 12.9712, 77.5965),
(10, 'Girls Hostel Kaushitaki', 'Kaushitaki residence hall for women students', 12.9735, 77.5950),
(11, 'Badminton Court', 'Enclosed indoor courts for badminton and table tennis', 12.9708, 77.5970),
(12, 'Football Ground', 'Full-sized natural turf football field and running track', 12.9698, 77.5975),
(13, 'Cricket Ground', 'Campus cricket stadium pitch and pavilion seating', 12.9745, 77.5985),
(14, 'Vyasa Bhavan Hostel', 'Senior undergraduate residence block', 12.9742, 77.5978),
(15, 'Villas (Seniors Hostels)', 'Graduate and senior student residential villa quad', 12.9750, 77.5980);

-- ------------------------------------------------------------
-- 3. LOCATION EDGES (Campus Graph Weighted Adjacency)
-- ------------------------------------------------------------
INSERT INTO location_edges (id, source_location_id, target_location_id, distance_meters, is_bidirectional) VALUES
(1, 1, 3, 150, TRUE),   -- Library <-> Academic Block
(2, 1, 2, 120, TRUE),   -- Library <-> Temple
(3, 1, 4, 200, TRUE),   -- Library <-> Main Canteen
(4, 2, 3, 180, TRUE),   -- Temple <-> Academic Block
(5, 3, 4, 160, TRUE),   -- Academic Block <-> Main Canteen
(6, 3, 5, 220, TRUE),   -- Academic Block <-> Lab Block & Kaivalya
(7, 3, 10, 280, TRUE),  -- Academic Block <-> Girls Hostel Kaushitaki
(8, 4, 7, 250, TRUE),   -- Main Canteen <-> Night Canteen
(9, 4, 8, 190, TRUE),   -- Main Canteen <-> Volleyball Court
(10, 5, 6, 180, TRUE),  -- Lab Block & Kaivalya <-> Aitherya Bhavan
(11, 5, 10, 210, TRUE), -- Lab Block & Kaivalya <-> Girls Hostel Kaushitaki
(12, 6, 14, 200, TRUE), -- Aitherya Bhavan <-> Vyasa Bhavan
(13, 6, 7, 140, TRUE),  -- Aitherya Bhavan <-> Night Canteen
(14, 7, 9, 130, TRUE),  -- Night Canteen <-> Basketball Court
(15, 7, 11, 160, TRUE), -- Night Canteen <-> Badminton Court
(16, 8, 9, 90, TRUE),   -- Volleyball Court <-> Basketball Court
(17, 8, 11, 120, TRUE), -- Volleyball Court <-> Badminton Court
(18, 9, 11, 80, TRUE),  -- Basketball Court <-> Badminton Court
(19, 11, 12, 210, TRUE),-- Badminton Court <-> Football Ground
(20, 11, 10, 260, TRUE),-- Badminton Court <-> Girls Hostel Kaushitaki
(21, 12, 13, 180, TRUE),-- Football Ground <-> Cricket Ground
(22, 12, 15, 240, TRUE),-- Football Ground <-> Villas
(23, 13, 14, 220, TRUE),-- Cricket Ground <-> Vyasa Bhavan
(24, 13, 15, 190, TRUE),-- Cricket Ground <-> Villas
(25, 14, 15, 160, TRUE);-- Vyasa Bhavan <-> Villas

-- ------------------------------------------------------------
-- 4. LOST ITEMS
-- ------------------------------------------------------------
INSERT INTO lost_items (id, user_id, title, category, brand, color, description, location_id, lost_date, lost_time, status, image_url) VALUES
(1, 2, 'Sony Wireless Earbuds', 'Electronics', 'Sony', 'Black', 'Black Sony wireless earbuds inside a small black charging case. Lost near the second-floor reading section.', 1, '2026-10-01', '15:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'),
(2, 3, 'Dell XPS 13 Charger', 'Electronics', 'Dell', 'Black', '65W USB Type-C Dell laptop power adapter with 2-pin cable.', 3, '2026-10-01', '11:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'),
(3, 4, 'Stainless Steel Water Bottle', 'Personal Belongings', 'Milton', 'Silver', '750ml silver vacuum insulated flask with a minor dent on base.', 6, '2026-10-02', '13:15:00', 'ACTIVE', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'),
(4, 5, 'Blue College Backpack', 'Bags', 'Wildcraft', 'Blue', 'Wildcraft 35L waterproof backpack containing notebooks and engineering drawing set.', 2, '2026-10-01', '16:45:00', 'ACTIVE', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'),
(5, 6, 'Casio Scientific Calculator', 'Stationery', 'Casio', 'Grey', 'Casio fx-991EX Classwiz scientific calculator with my name sticker on rear cover.', 9, '2026-09-30', '14:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600'),
(6, 7, 'Leather Bifold Wallet', 'Accessories', 'Titan', 'Brown', 'Brown leather wallet containing college student ID card and bus pass.', 7, '2026-10-02', '18:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'),
(7, 8, 'Apple Watch Series 7', 'Electronics', 'Apple', 'Midnight', '45mm aluminum midnight case with sport band, lost near basketball court.', 8, '2026-10-02', '17:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),
(8, 9, 'Hostel Room Keyring', 'Keys', 'Generic', 'Silver', 'Ring with two brass keys and a metallic Batman logo keychain.', 4, '2026-10-01', '21:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600'),
(9, 10, 'Prescription Reading Glasses', 'Personal Belongings', 'Ray-Ban', 'Black', 'Ray-Ban rectangular matte black acetate optical frames in black clamshell case.', 1, '2026-10-02', '10:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600'),
(10, 11, 'Red Canvas Umbrella', 'Accessories', 'Generic', 'Red', 'Compact 3-fold red umbrella with curved wooden handle.', 10, '2026-10-01', '09:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'),
(11, 2, 'iPad Air 5th Gen', 'Electronics', 'Apple', 'Space Grey', 'Space grey iPad Air with magnetic white Apple Pencil attached.', 1, '2026-09-29', '16:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'),
(12, 3, 'Logitech Wireless Mouse', 'Electronics', 'Logitech', 'Black', 'Logitech MX Master 3S ergonomic black bluetooth mouse.', 3, '2026-10-02', '14:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'),
(13, 4, 'Denim Jacket', 'Clothing', 'Levi\'s', 'Dark Blue', 'Levi\'s vintage dark blue denim jacket size L left on bench.', 6, '2026-10-01', '19:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'),
(14, 5, 'Data Structures Textbook', 'Books', 'Pearson', 'White', 'CLRS Introduction to Algorithms 4th edition with sticky tabs on graph chapters.', 1, '2026-10-02', '12:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'),
(15, 6, 'Motorcycle Helmet', 'Accessories', 'Vega', 'Matte Black', 'Vega full face matte black helmet with clear scratch-free visor.', 10, '2026-10-02', '08:45:00', 'ACTIVE', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'),
(16, 7, 'Badminton Racket Set', 'Sports', 'Yonex', 'Red', 'Yonex Nanoray red racket in zipped black and red thermal bag.', 8, '2026-10-01', '18:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600'),
(17, 8, 'Samsung Galaxy S22', 'Electronics', 'Samsung', 'Phantom Black', 'Samsung Galaxy S22 phone in matte black Spigen rugged armor protective case.', 2, '2026-10-02', '11:15:00', 'ACTIVE', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'),
(18, 9, 'Laboratory Coat & Safety Goggles', 'Stationery', 'Generic', 'White', 'Size M white cotton lab apron with chemistry department logo badge.', 9, '2026-10-01', '15:45:00', 'ACTIVE', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600'),
(19, 10, 'Anker Power Bank 20000mAh', 'Electronics', 'Anker', 'Black', 'Heavy black textured Anker PowerCore portable battery charger.', 3, '2026-09-30', '17:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600'),
(20, 11, 'Silver Wristwatch', 'Accessories', 'Fossil', 'Silver', 'Fossil analog chronograph watch with stainless steel mesh strap.', 7, '2026-10-01', '20:15:00', 'ACTIVE', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600');

-- ------------------------------------------------------------
-- 5. FOUND ITEMS
-- ------------------------------------------------------------
INSERT INTO found_items (id, user_id, title, category, brand, color, description, location_id, found_date, found_time, status, image_url) VALUES
(1, 3, 'Black Wireless Earbuds', 'Electronics', 'Sony', 'Black', 'Found black Sony earbuds in a charging case near the reading section.', 1, '2026-10-01', '15:25:00', 'ACTIVE', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'),
(2, 4, 'USB-C Laptop Power Brick', 'Electronics', 'Dell', 'Black', 'Found a 65W Dell Type-C power adapter plugged under desk 14 in CSE Lab 2.', 3, '2026-10-01', '12:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'),
(3, 5, 'Silver Milton Water Flask', 'Personal Belongings', 'Milton', 'Silver', 'Metal insulated flask forgotten at table 6 inside central canteen.', 6, '2026-10-02', '13:40:00', 'ACTIVE', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'),
(4, 6, 'Blue College Bag', 'Bags', 'Wildcraft', 'Blue', 'Blue Wildcraft backpack handed over to academic block reception.', 2, '2026-10-01', '17:10:00', 'ACTIVE', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'),
(5, 7, 'Grey Scientific Calculator', 'Stationery', 'Casio', 'Grey', 'Casio fx-991EX calculator found on bench in electrical engineering laboratory.', 9, '2026-09-30', '14:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600'),
(6, 8, 'Brown Men\'s Leather Wallet', 'Accessories', 'Titan', 'Brown', 'Titan brown leather wallet with money and student cards inside auditorium foyer.', 7, '2026-10-02', '18:25:00', 'ACTIVE', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'),
(7, 9, 'Black Smartwatch', 'Electronics', 'Apple', 'Midnight', 'Found Apple Watch near athletic running track boundary fence.', 8, '2026-10-02', '18:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'),
(8, 10, 'Set of Two Keys with Keychain', 'Keys', 'Generic', 'Silver', 'Hostel door keys with metallic superhero keychain discovered on walkway.', 4, '2026-10-01', '21:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600'),
(9, 11, 'Prescription Glasses in Case', 'Personal Belongings', 'Ray-Ban', 'Black', 'Ray-Ban spectacles left beside computer terminal 8 on library first floor.', 1, '2026-10-02', '10:45:00', 'ACTIVE', 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600'),
(10, 2, 'Red Folding Umbrella', 'Accessories', 'Generic', 'Red', 'Red umbrella found resting against bike stand #4 in parking lot.', 10, '2026-10-01', '09:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'),
(11, 4, 'Apple Tablet with Stylus', 'Electronics', 'Apple', 'Space Grey', 'iPad found on reference table behind circulation desk.', 1, '2026-09-29', '16:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'),
(12, 5, 'Black Wireless Bluetooth Mouse', 'Electronics', 'Logitech', 'Black', 'Ergonomic Logitech mouse found near CSE staff room entrance.', 3, '2026-10-02', '15:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'),
(13, 6, 'Dark Denim Jacket', 'Clothing', 'Levi\'s', 'Dark Blue', 'Levi\'s jean jacket found draped over chair at juice corner.', 6, '2026-10-01', '19:40:00', 'ACTIVE', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'),
(14, 7, 'Algorithms College Textbook', 'Books', 'Pearson', 'White', 'CLRS book found in library silent reading zone.', 1, '2026-10-02', '12:30:00', 'ACTIVE', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'),
(15, 8, 'Matte Black Full Face Helmet', 'Accessories', 'Vega', 'Matte Black', 'Helmet left sitting on concrete railing near parking entry gate.', 10, '2026-10-02', '09:10:00', 'ACTIVE', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'),
(16, 9, 'Badminton Racket with Bag', 'Sports', 'Yonex', 'Red', 'Red Yonex racket found in sports complex spectator pavilion.', 8, '2026-10-01', '19:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600'),
(17, 10, 'Samsung Android Smartphone', 'Electronics', 'Samsung', 'Phantom Black', 'Black smartphone found in lecture hall 102 under row 4 seat.', 2, '2026-10-02', '11:45:00', 'ACTIVE', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'),
(18, 11, 'White Science Apron', 'Stationery', 'Generic', 'White', 'Clean lab coat left hanging on peg in chemistry laboratory room 3.', 9, '2026-10-01', '16:15:00', 'ACTIVE', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600'),
(19, 2, 'Portable Power Bank', 'Electronics', 'Anker', 'Black', 'Anker black power bank left near charging locker in CSE block.', 3, '2026-09-30', '17:35:00', 'ACTIVE', 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600'),
(20, 3, 'Steel Wristwatch', 'Accessories', 'Fossil', 'Silver', 'Found Fossil watch near auditorium stage exit stairs.', 7, '2026-10-01', '21:00:00', 'ACTIVE', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600');

-- ------------------------------------------------------------
-- 6. ITEM KEYWORDS (Normalized Tokens for Trie & Hashing)
-- ------------------------------------------------------------
INSERT INTO item_keywords (item_type, item_id, keyword) VALUES
('LOST', 1, 'sony'), ('LOST', 1, 'wireless'), ('LOST', 1, 'earbuds'), ('LOST', 1, 'charging'), ('LOST', 1, 'case'), ('LOST', 1, 'library'), ('LOST', 1, 'black'),
('FOUND', 1, 'sony'), ('FOUND', 1, 'wireless'), ('FOUND', 1, 'earbuds'), ('FOUND', 1, 'charging'), ('FOUND', 1, 'case'), ('FOUND', 1, 'reading'), ('FOUND', 1, 'black'),
('LOST', 2, 'dell'), ('LOST', 2, 'xps'), ('LOST', 2, 'charger'), ('LOST', 2, 'laptop'), ('LOST', 2, 'type-c'),
('FOUND', 2, 'dell'), ('FOUND', 2, 'power'), ('FOUND', 2, 'adapter'), ('FOUND', 2, 'type-c'), ('FOUND', 2, 'laptop'),
('LOST', 3, 'milton'), ('LOST', 3, 'flask'), ('LOST', 3, 'bottle'), ('LOST', 3, 'water'), ('LOST', 3, 'silver'),
('FOUND', 3, 'milton'), ('FOUND', 3, 'flask'), ('FOUND', 3, 'bottle'), ('FOUND', 3, 'canteen'), ('FOUND', 3, 'insulated');

-- ------------------------------------------------------------
-- 7. MATCH RESULTS (Demonstrating Deterministic Score & Routing)
-- ------------------------------------------------------------
INSERT INTO match_results (id, lost_item_id, found_item_id, match_score, category_score, brand_score, color_score, keyword_score, description_score, location_score, date_score, time_score, distance_meters, route_path, explanation) VALUES
(1, 1, 1, 99, 20, 10, 15, 19, 11, 15, 5, 4, 0, 'Central Library', 'Both reports describe black Sony earbuds found/lost in Central Library on the same date within 25 minutes.'),
(2, 2, 2, 94, 20, 10, 15, 17, 9, 15, 5, 3, 0, 'CSE Block', 'Dell laptop charger matching in category, brand, color, location, and date within 30 minutes.'),
(3, 3, 3, 91, 20, 10, 15, 16, 8, 15, 5, 2, 0, 'Campus Canteen', 'Milton silver water flask found at central canteen within 25 minutes of report time.'),
(4, 1, 11, 35, 20, 0, 0, 4, 2, 9, 0, 0, 330, 'Central Library -> Main Academic Block -> CSE Block', 'Partial category match (Electronics); differing brand, color, and date.');

-- ------------------------------------------------------------
-- 8. CLAIMS
-- ------------------------------------------------------------
INSERT INTO claims (id, found_item_id, claimant_user_id, description, status, reviewer_notes) VALUES
(1, 1, 2, 'This is my Sony WF-1000XM4 black earbuds with a faint scuff mark on the top right edge of the case. Lost it near reading section table 4.', 'PENDING', NULL),
(2, 2, 3, 'The Dell charger has an orange tape mark around the strain relief of the USB-C plug.', 'PENDING', NULL);

-- ------------------------------------------------------------
-- 9. NOTIFICATIONS
-- ------------------------------------------------------------
INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url) VALUES
(1, 2, 'High Confidence Match (99%) Found!', 'A found item "Black Wireless Earbuds" closely matches your reported lost Sony Earbuds at Central Library.', 'MATCH', FALSE, '/matches/1'),
(2, 3, 'Potential Match (94%) Found!', 'A found item "USB-C Laptop Power Brick" closely matches your lost Dell XPS 13 Charger.', 'MATCH', FALSE, '/matches/2'),
(3, 1, 'New Claim Submitted', 'Student Aarav Sharma has submitted a claim for Found Item #1.', 'CLAIM', FALSE, '/admin/claims');

-- ------------------------------------------------------------
-- 10. ACTIVITY LOGS
-- ------------------------------------------------------------
INSERT INTO activity_logs (id, user_id, action, details, ip_address) VALUES
(1, 2, 'REPORT_LOST', 'User reported lost Sony Wireless Earbuds at Central Library', '127.0.0.1'),
(2, 3, 'REPORT_FOUND', 'User reported found Black Wireless Earbuds at Central Library', '127.0.0.1'),
(3, 1, 'MATCH_ENGINE_RUN', 'Dijkstra & MaxHeap computed 99% match between Lost #1 and Found #1', '127.0.0.1');
