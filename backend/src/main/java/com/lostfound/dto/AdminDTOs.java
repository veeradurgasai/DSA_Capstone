package com.lostfound.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class AdminDTOs {

    public record StatisticsResponse(
            long totalUsers,
            long studentCount,
            long adminCount,
            long pendingStudentsCount,
            long totalLostItems,
            long activeLostItems,
            long totalFoundItems,
            long activeFoundItems,
            long totalResolved,
            long pendingClaims,
            long approvedClaims,
            long highMatchesCount,
            Map<String, Long> reportsByCategory,
            Map<String, Long> reportsByLocation
    ) {
        public StatisticsResponse(long totalUsers, long studentCount, long adminCount,
                                  long totalLostItems, long activeLostItems,
                                  long totalFoundItems, long activeFoundItems,
                                  long totalResolved, long pendingClaims, long approvedClaims,
                                  long highMatchesCount, Map<String, Long> reportsByCategory,
                                  Map<String, Long> reportsByLocation) {
            this(totalUsers, studentCount, adminCount, 0, totalLostItems, activeLostItems,
                    totalFoundItems, activeFoundItems, totalResolved, pendingClaims, approvedClaims,
                    highMatchesCount, reportsByCategory, reportsByLocation);
        }
    }

    public record StudentApprovalDTO(
            Long id,
            String name,
            String collegeEmail,
            String personalEmail,
            String phone,
            String accountStatus,
            LocalDateTime registrationDate
    ) {
        public String email() {
            return collegeEmail;
        }

        public LocalDateTime registeredAt() {
            return registrationDate;
        }
    }
}
