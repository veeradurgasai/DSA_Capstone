package com.lostfound.service;

import com.lostfound.dto.AdminDTOs.*;
import com.lostfound.dto.AuthDTOs.UserProfileResponse;
import com.lostfound.entity.LostItem;
import com.lostfound.entity.FoundItem;
import com.lostfound.entity.User;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRepository claimRepository;
    private final MatchResultRepository matchResultRepository;

    public AdminService(UserRepository userRepository,
                        LostItemRepository lostItemRepository,
                        FoundItemRepository foundItemRepository,
                        ClaimRepository claimRepository,
                        MatchResultRepository matchResultRepository) {
        this.userRepository = userRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.claimRepository = claimRepository;
        this.matchResultRepository = matchResultRepository;
    }

    public StatisticsResponse getPlatformStatistics() {
        long totalUsers = userRepository.count();
        long studentCount = userRepository.countByRole("ROLE_STUDENT");
        long adminCount = userRepository.countByRole("ROLE_ADMIN");
        long pendingStudents = userRepository.countByAccountStatus("PENDING");

        List<LostItem> allLost = lostItemRepository.findAll();
        List<FoundItem> allFound = foundItemRepository.findAll();

        long totalLost = allLost.size();
        long activeLost = allLost.stream().filter(i -> "ACTIVE".equals(i.getStatus())).count();
        long resolvedLost = allLost.stream().filter(i -> "RESOLVED".equals(i.getStatus())).count();

        long totalFound = allFound.size();
        long activeFound = allFound.stream().filter(i -> "ACTIVE".equals(i.getStatus()) || "FOUND".equals(i.getStatus()) || "KEEPING_WITH_ME".equals(i.getStatus())).count();
        long resolvedFound = allFound.stream().filter(i -> "RESOLVED".equals(i.getStatus()) || "HANDED_TO_LOST_PERSON".equals(i.getStatus())).count();

        long totalResolved = resolvedLost + resolvedFound;
        long pendingClaims = claimRepository.countByStatus("PENDING");
        long approvedClaims = claimRepository.countByStatus("APPROVED");

        long highMatches = matchResultRepository.findAll().stream()
                .filter(m -> m.getMatchScore() >= 75)
                .count();

        Map<String, Long> reportsByCategory = new HashMap<>();
        for (LostItem item : allLost) {
            reportsByCategory.put(item.getCategory(), reportsByCategory.getOrDefault(item.getCategory(), 0L) + 1);
        }
        for (FoundItem item : allFound) {
            reportsByCategory.put(item.getCategory(), reportsByCategory.getOrDefault(item.getCategory(), 0L) + 1);
        }

        Map<String, Long> reportsByLocation = new HashMap<>();
        for (LostItem item : allLost) {
            if (item.getLocation() != null) {
                String loc = item.getLocation().getName();
                reportsByLocation.put(loc, reportsByLocation.getOrDefault(loc, 0L) + 1);
            }
        }
        for (FoundItem item : allFound) {
            if (item.getLocation() != null) {
                String loc = item.getLocation().getName();
                reportsByLocation.put(loc, reportsByLocation.getOrDefault(loc, 0L) + 1);
            }
        }

        return new StatisticsResponse(
                totalUsers, studentCount, adminCount, pendingStudents,
                totalLost, activeLost,
                totalFound, activeFound,
                totalResolved, pendingClaims, approvedClaims,
                highMatches, reportsByCategory, reportsByLocation
        );
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserProfileResponse(
                        u.getId(), u.getName(), u.getEmail(), u.getPhone(),
                        u.getRole(), u.isActive(), u.getPersonalEmail(),
                        u.getAccountStatus(), u.getCreatedAt()
                ))
                .toList();
    }

    public List<StudentApprovalDTO> getPendingStudents() {
        return userRepository.findByRoleAndAccountStatus("ROLE_STUDENT", "PENDING").stream()
                .map(u -> new StudentApprovalDTO(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getPersonalEmail(),
                        u.getPhone(),
                        u.getAccountStatus(),
                        u.getCreatedAt()
                ))
                .toList();
    }

    public List<StudentApprovalDTO> getAllStudents() {
        return userRepository.findAll().stream()
                .filter(u -> "ROLE_STUDENT".equals(u.getRole()))
                .map(u -> new StudentApprovalDTO(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getPersonalEmail(),
                        u.getPhone(),
                        u.getAccountStatus(),
                        u.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public StudentApprovalDTO reviewStudentApproval(Long studentId, String status) {
        String newStatus = status.trim().toUpperCase();
        if (!"APPROVED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new BadRequestException("Status must be either APPROVED or REJECTED.");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        student.setAccountStatus(newStatus);
        User saved = userRepository.save(student);

        return new StudentApprovalDTO(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPersonalEmail(),
                saved.getPhone(),
                saved.getAccountStatus(),
                saved.getCreatedAt()
        );
    }

    @Transactional
    public UserProfileResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return new UserProfileResponse(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(),
                saved.getRole(), saved.isActive(), saved.getPersonalEmail(),
                saved.getAccountStatus(), saved.getCreatedAt()
        );
    }

    @Transactional
    public void deleteLostItem(Long itemId) {
        if (!lostItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Lost item not found: " + itemId);
        }
        matchResultRepository.deleteByLostItemId(itemId);
        lostItemRepository.deleteById(itemId);
    }

    @Transactional
    public void deleteFoundItem(Long itemId) {
        if (!foundItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Found item not found: " + itemId);
        }
        matchResultRepository.deleteByFoundItemId(itemId);
        claimRepository.deleteByFoundItemId(itemId);
        foundItemRepository.deleteById(itemId);
    }
}
