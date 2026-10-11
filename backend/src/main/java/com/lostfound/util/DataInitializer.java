package com.lostfound.util;

import com.lostfound.entity.*;
import com.lostfound.matching.KeywordProcessor;
import com.lostfound.repository.*;
import com.lostfound.service.CampusService;
import com.lostfound.service.ItemService;
import com.lostfound.service.MatchingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final LocationEdgeRepository edgeRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ItemKeywordRepository keywordRepository;
    private final ClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CampusService campusService;
    private final ItemService itemService;
    private final MatchingService matchingService;

    public DataInitializer(UserRepository userRepository,
                           LocationRepository locationRepository,
                           LocationEdgeRepository edgeRepository,
                           LostItemRepository lostItemRepository,
                           FoundItemRepository foundItemRepository,
                           ItemKeywordRepository keywordRepository,
                           ClaimRepository claimRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           CampusService campusService,
                           ItemService itemService,
                           MatchingService matchingService) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.edgeRepository = edgeRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.keywordRepository = keywordRepository;
        this.claimRepository = claimRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.campusService = campusService;
        this.itemService = itemService;
        this.matchingService = matchingService;
    }

    @Override
    public void run(String... args) {
        new java.io.File("./data").mkdirs();
        new java.io.File("./uploads").mkdirs();

        // Ensure the exact 15 campus locations are present
        if (locationRepository.findByNameIgnoreCase("Library").isEmpty()) {
            log.info("Migrating / Seeding exact 15 campus locations and graph edges...");
            seedLocationsAndEdges();
        }

        seedUsers();

        if (lostItemRepository.count() == 0 && foundItemRepository.count() == 0) {
            log.info("Seeding realistic campus Lost & Found items and running Matching Engine...");
            seedItems();
        }

        campusService.refreshGraph();
        log.info("System initialization complete. Campus Graph vertices: {}, edges: {}",
                campusService.getGraph().getNodeCount(), campusService.getGraph().getEdgeCount());
    }

    /**
     * Seeds the exact 15 campus locations requested by academic requirements.
     */
    private void seedLocationsAndEdges() {
        edgeRepository.deleteAll();

        // 1. Library
        Location l1 = saveOrGetLocation("Library", "Central academic library and reference reading room", 12.9716, 77.5946);
        // 2. Temple
        Location l2 = saveOrGetLocation("Temple", "Campus temple and peaceful heritage garden pavilion", 12.9722, 77.5938);
        // 3. Academic Block
        Location l3 = saveOrGetLocation("Academic Block", "Main administrative offices, lecture halls, and auditoriums", 12.9725, 77.5955);
        // 4. Main Canteen
        Location l4 = saveOrGetLocation("Main Canteen", "Central dining hall and campus food court", 12.9710, 77.5950);
        // 5. Lab Block & Kaivalya Bhavan Hostel
        Location l5 = saveOrGetLocation("Lab Block & Kaivalya Bhavan Hostel", "Engineering laboratories with attached student residential wings", 12.9728, 77.5968);
        // 6. Aitherya Bhavan Hostel
        Location l6 = saveOrGetLocation("Aitherya Bhavan Hostel", "Junior undergraduate hostel residence", 12.9738, 77.5972);
        // 7. Night Canteen
        Location l7 = saveOrGetLocation("Night Canteen", "Late-night student cafeteria and refreshment hub", 12.9718, 77.5962);
        // 8. Volleyball Court
        Location l8 = saveOrGetLocation("Volleyball Court", "Outdoor standard volleyball court near sports arena", 12.9705, 77.5958);
        // 9. Basketball Court
        Location l9 = saveOrGetLocation("Basketball Court", "Floodlit championship basketball courts", 12.9712, 77.5965);
        // 10. Girls Hostel Kaushitaki
        Location l10 = saveOrGetLocation("Girls Hostel Kaushitaki", "Kaushitaki residence hall for women students", 12.9735, 77.5950);
        // 11. Badminton Court
        Location l11 = saveOrGetLocation("Badminton Court", "Enclosed indoor courts for badminton and table tennis", 12.9708, 77.5970);
        // 12. Football Ground
        Location l12 = saveOrGetLocation("Football Ground", "Full-sized natural turf football field and running track", 12.9698, 77.5975);
        // 13. Cricket Ground
        Location l13 = saveOrGetLocation("Cricket Ground", "Campus cricket stadium pitch and pavilion seating", 12.9745, 77.5985);
        // 14. Vyasa Bhavan Hostel
        Location l14 = saveOrGetLocation("Vyasa Bhavan Hostel", "Senior undergraduate residence block", 12.9742, 77.5978);
        // 15. Villas (Seniors Hostels)
        Location l15 = saveOrGetLocation("Villas (Seniors Hostels)", "Graduate and senior student residential villa quad", 12.9750, 77.5980);

        // Clean out obsolete location names if any exist from older schema
        for (Location loc : locationRepository.findAll()) {
            if (!isOfficialLocation(loc.getName())) {
                try {
                    locationRepository.delete(loc);
                } catch (Exception ignored) {}
            }
        }

        // Connect campus graph edges with realistic walking distances in meters
        edgeRepository.save(new LocationEdge(l1, l3, 150, true)); // Library <-> Academic Block
        edgeRepository.save(new LocationEdge(l1, l2, 120, true)); // Library <-> Temple
        edgeRepository.save(new LocationEdge(l1, l4, 200, true)); // Library <-> Main Canteen
        edgeRepository.save(new LocationEdge(l2, l3, 180, true)); // Temple <-> Academic Block
        edgeRepository.save(new LocationEdge(l3, l4, 160, true)); // Academic Block <-> Main Canteen
        edgeRepository.save(new LocationEdge(l3, l5, 220, true)); // Academic Block <-> Lab Block & Kaivalya Bhavan Hostel
        edgeRepository.save(new LocationEdge(l3, l10, 280, true)); // Academic Block <-> Girls Hostel Kaushitaki
        edgeRepository.save(new LocationEdge(l4, l7, 250, true)); // Main Canteen <-> Night Canteen
        edgeRepository.save(new LocationEdge(l4, l8, 190, true)); // Main Canteen <-> Volleyball Court
        edgeRepository.save(new LocationEdge(l5, l6, 180, true)); // Lab Block & Kaivalya Bhavan Hostel <-> Aitherya Bhavan Hostel
        edgeRepository.save(new LocationEdge(l5, l10, 210, true)); // Lab Block & Kaivalya Bhavan Hostel <-> Girls Hostel Kaushitaki
        edgeRepository.save(new LocationEdge(l6, l14, 200, true)); // Aitherya Bhavan Hostel <-> Vyasa Bhavan Hostel
        edgeRepository.save(new LocationEdge(l6, l7, 140, true)); // Aitherya Bhavan Hostel <-> Night Canteen
        edgeRepository.save(new LocationEdge(l7, l9, 130, true)); // Night Canteen <-> Basketball Court
        edgeRepository.save(new LocationEdge(l7, l11, 160, true)); // Night Canteen <-> Badminton Court
        edgeRepository.save(new LocationEdge(l8, l9, 90, true));  // Volleyball Court <-> Basketball Court
        edgeRepository.save(new LocationEdge(l8, l11, 120, true)); // Volleyball Court <-> Badminton Court
        edgeRepository.save(new LocationEdge(l9, l11, 80, true));  // Basketball Court <-> Badminton Court
        edgeRepository.save(new LocationEdge(l11, l12, 210, true)); // Badminton Court <-> Football Ground
        edgeRepository.save(new LocationEdge(l11, l10, 260, true)); // Badminton Court <-> Girls Hostel Kaushitaki
        edgeRepository.save(new LocationEdge(l12, l13, 180, true)); // Football Ground <-> Cricket Ground
        edgeRepository.save(new LocationEdge(l12, l15, 240, true)); // Football Ground <-> Villas (Seniors Hostels)
        edgeRepository.save(new LocationEdge(l13, l14, 220, true)); // Cricket Ground <-> Vyasa Bhavan Hostel
        edgeRepository.save(new LocationEdge(l13, l15, 190, true)); // Cricket Ground <-> Villas (Seniors Hostels)
        edgeRepository.save(new LocationEdge(l14, l15, 160, true)); // Vyasa Bhavan Hostel <-> Villas (Seniors Hostels)
    }

    private Location saveOrGetLocation(String name, String description, Double lat, Double lng) {
        return locationRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> locationRepository.save(new Location(null, name, description, lat, lng)));
    }

    private boolean isOfficialLocation(String name) {
        List<String> valid = List.of(
                "Library", "Temple", "Academic Block", "Main Canteen",
                "Lab Block & Kaivalya Bhavan Hostel", "Aitherya Bhavan Hostel",
                "Night Canteen", "Volleyball Court", "Basketball Court",
                "Girls Hostel Kaushitaki", "Badminton Court", "Football Ground",
                "Cricket Ground", "Vyasa Bhavan Hostel", "Villas (Seniors Hostels)"
        );
        return valid.stream().anyMatch(v -> v.equalsIgnoreCase(name));
    }

    private void seedUsers() {
        String adminPass = passwordEncoder.encode("admin123");
        String studentPass = passwordEncoder.encode("student123");

        // Campus Admin (Approved)
        if (userRepository.findByEmail("admin@campus.edu").isEmpty()) {
            User admin = new User("Campus Admin", "admin@campus.edu", adminPass, "+1-555-0100", "ROLE_ADMIN");
            admin.setAccountStatus("APPROVED");
            userRepository.save(admin);
        }

        // Second Admin for Multi-Admin Verification
        if (userRepository.findByEmail("admin2@campus.edu").isEmpty()) {
            User admin2 = new User("Assistant Admin", "admin2@campus.edu", adminPass, "+1-555-0105", "ROLE_ADMIN");
            admin2.setAccountStatus("APPROVED");
            userRepository.save(admin2);
        }

        // Active Students (Approved)
        saveApprovedStudent("Aarav Sharma", "aarav.sharma@campus.edu", "aarav.sharma@gmail.com", studentPass, "+1-555-0101");
        saveApprovedStudent("Bhavna Patel", "bhavna.patel@campus.edu", "bhavna.patel@gmail.com", studentPass, "+1-555-0102");
        saveApprovedStudent("Chirag Rao", "chirag.rao@campus.edu", "chirag.rao@gmail.com", studentPass, "+1-555-0103");
        saveApprovedStudent("Divya Nair", "divya.nair@campus.edu", "divya.nair@gmail.com", studentPass, "+1-555-0104");

        // Seed 2 Pending Student Registrations so Admin can immediately test Approval / Rejection
        savePendingStudent("Karan Malhotra", "karan.malhotra@campus.edu", "karan.m99@gmail.com", studentPass, "+1-555-0199");
        savePendingStudent("Pooja Hegde", "pooja.hegde@campus.edu", "pooja.hegde@yahoo.com", studentPass, "+1-555-0188");
    }

    private void saveApprovedStudent(String name, String email, String personalEmail, String passwordHash, String phone) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User u = new User(name, email, personalEmail, passwordHash, phone, "ROLE_STUDENT", "APPROVED");
            userRepository.save(u);
        }
    }

    private void savePendingStudent(String name, String email, String personalEmail, String passwordHash, String phone) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User u = new User(name, email, personalEmail, passwordHash, phone, "ROLE_STUDENT", "PENDING");
            userRepository.save(u);
        }
    }

    private void seedItems() {
        User aarav = userRepository.findByEmail("aarav.sharma@campus.edu").orElse(null);
        User bhavna = userRepository.findByEmail("bhavna.patel@campus.edu").orElse(null);
        User chirag = userRepository.findByEmail("chirag.rao@campus.edu").orElse(null);
        User divya = userRepository.findByEmail("divya.nair@campus.edu").orElse(null);

        if (aarav == null || bhavna == null) return;

        Location lib = locationRepository.findByNameIgnoreCase("Library")
                .orElseGet(() -> locationRepository.findAll().get(0));
        Location academic = locationRepository.findByNameIgnoreCase("Academic Block")
                .orElseGet(() -> locationRepository.findAll().get(0));
        Location canteen = locationRepository.findByNameIgnoreCase("Main Canteen")
                .orElseGet(() -> locationRepository.findAll().get(0));

        // 1. Primary Scenario Lost Item: Sony Wireless Earbuds by Aarav
        LostItem lost1 = new LostItem();
        lost1.setUser(aarav);
        lost1.setTitle("Sony Wireless Earbuds");
        lost1.setCategory("Electronics");
        lost1.setBrand("Sony");
        lost1.setColor("Black");
        lost1.setDescription("Black Sony wireless earbuds inside a small black charging case. Lost near the second-floor reading section.");
        lost1.setOwnerDescription("Matte black charging case with small silver Sony emblem on top; left earbud has a tiny mark on the tip.");
        lost1.setLocation(lib);
        lost1.setLostDate(LocalDate.of(2026, 10, 1));
        lost1.setLostTime(LocalTime.of(15, 0));
        lost1.setStatus("ACTIVE");
        lost1.setImageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600");
        lost1 = lostItemRepository.save(lost1);
        indexKeywords("LOST", lost1.getId(), lost1.getTitle() + " " + lost1.getDescription());

        // 2. Primary Scenario Found Item: Black Wireless Earbuds by Bhavna
        FoundItem found1 = new FoundItem();
        found1.setUser(bhavna);
        found1.setTitle("Black Wireless Earbuds");
        found1.setCategory("Electronics");
        found1.setBrand("Sony");
        found1.setColor("Black");
        found1.setDescription("Found black Sony earbuds in a charging case near the reading section.");
        found1.setHandoverOption("KEEPING_WITH_ME");
        found1.setFinderDescription("Found on the corner desk by the reference section. Will keep it safely with me until owner verifies details.");
        found1.setLocation(lib);
        found1.setFoundDate(LocalDate.of(2026, 10, 1));
        found1.setFoundTime(LocalTime.of(15, 25));
        found1.setStatus("FOUND");
        found1.setImageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600");
        found1 = foundItemRepository.save(found1);
        indexKeywords("FOUND", found1.getId(), found1.getTitle() + " " + found1.getDescription());

        // 3. Dell Laptop Charger by Bhavna
        LostItem lost2 = new LostItem();
        lost2.setUser(bhavna);
        lost2.setTitle("Dell XPS 13 Charger");
        lost2.setCategory("Electronics");
        lost2.setBrand("Dell");
        lost2.setColor("Black");
        lost2.setDescription("65W USB Type-C Dell laptop power adapter with 2-pin cable.");
        lost2.setLocation(academic);
        lost2.setLostDate(LocalDate.of(2026, 10, 1));
        lost2.setLostTime(LocalTime.of(11, 30));
        lost2.setStatus("ACTIVE");
        lost2.setImageUrl("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600");
        lost2 = lostItemRepository.save(lost2);
        indexKeywords("LOST", lost2.getId(), lost2.getTitle() + " " + lost2.getDescription());

        // Found Dell Charger by Chirag
        if (chirag != null) {
            FoundItem found2 = new FoundItem();
            found2.setUser(chirag);
            found2.setTitle("USB-C Laptop Power Brick");
            found2.setCategory("Electronics");
            found2.setBrand("Dell");
            found2.setColor("Black");
            found2.setDescription("Found a 65W Dell Type-C power adapter plugged under desk 14 in academic lecture hall 2.");
            found2.setHandoverOption("HANDED_TO_OSW");
            found2.setFinderDescription("Handed over to OSW / Academic Block Admin Reception desk.");
            found2.setLocation(academic);
            found2.setFoundDate(LocalDate.of(2026, 10, 1));
            found2.setFoundTime(LocalTime.of(12, 0));
            found2.setStatus("HANDED_TO_OSW");
            found2.setImageUrl("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600");
            found2 = foundItemRepository.save(found2);
            indexKeywords("FOUND", found2.getId(), found2.getTitle() + " " + found2.getDescription());
        }

        // 4. Milton Water Bottle by Chirag
        if (chirag != null && divya != null) {
            LostItem lost3 = new LostItem();
            lost3.setUser(chirag);
            lost3.setTitle("Stainless Steel Water Bottle");
            lost3.setCategory("Personal Belongings");
            lost3.setBrand("Milton");
            lost3.setColor("Silver");
            lost3.setDescription("750ml silver vacuum insulated flask with a minor dent on base.");
            lost3.setLocation(canteen);
            lost3.setLostDate(LocalDate.of(2026, 10, 2));
            lost3.setLostTime(LocalTime.of(13, 15));
            lost3.setStatus("ACTIVE");
            lost3.setImageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600");
            lost3 = lostItemRepository.save(lost3);
            indexKeywords("LOST", lost3.getId(), lost3.getTitle() + " " + lost3.getDescription());

            FoundItem found3 = new FoundItem();
            found3.setUser(divya);
            found3.setTitle("Silver Milton Water Flask");
            found3.setCategory("Personal Belongings");
            found3.setBrand("Milton");
            found3.setColor("Silver");
            found3.setDescription("Metal insulated flask forgotten at table 6 inside central canteen.");
            found3.setHandoverOption("KEEPING_WITH_ME");
            found3.setLocation(canteen);
            found3.setFoundDate(LocalDate.of(2026, 10, 2));
            found3.setFoundTime(LocalTime.of(13, 40));
            found3.setStatus("FOUND");
            found3.setImageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600");
            found3 = foundItemRepository.save(found3);
            indexKeywords("FOUND", found3.getId(), found3.getTitle() + " " + found3.getDescription());

            matchingService.evaluateAndSaveMatchesForLost(lost3);
        }

        // Run matching pipeline on the seeded items
        matchingService.evaluateAndSaveMatchesForLost(lost1);
        matchingService.evaluateAndSaveMatchesForLost(lost2);

        // Seed a sample claim for testing
        Claim sampleClaim = new Claim();
        sampleClaim.setFoundItem(found1);
        sampleClaim.setClaimant(aarav);
        sampleClaim.setDescription("This is my Sony WF-1000XM4 earbuds with small scratch on upper case lid.");
        sampleClaim.setFinderNotes("Earbuds case verified. Charging cable was also inside pouch.");
        sampleClaim.setStatus("PENDING");
        claimRepository.save(sampleClaim);
    }

    private void indexKeywords(String type, Long itemId, String text) {
        Set<String> kws = KeywordProcessor.extractKeywords(text);
        for (String kw : kws) {
            keywordRepository.save(new ItemKeyword(type, itemId, kw));
            itemService.getSearchTrie().insert(kw);
        }
    }
}
