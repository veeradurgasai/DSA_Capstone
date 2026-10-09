package com.lostfound.controller;

import com.lostfound.dto.AdminDTOs.StatisticsResponse;
import com.lostfound.dto.AdminDTOs.StudentApprovalDTO;
import com.lostfound.dto.AuthDTOs.ApprovalRequest;
import com.lostfound.dto.AuthDTOs.UserProfileResponse;
import com.lostfound.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getStatistics() {
        return ResponseEntity.ok(adminService.getPlatformStatistics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserProfileResponse> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @GetMapping("/pending-students")
    public ResponseEntity<List<StudentApprovalDTO>> getPendingStudents() {
        return ResponseEntity.ok(adminService.getPendingStudents());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentApprovalDTO>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PutMapping("/students/{id}/approval")
    public ResponseEntity<StudentApprovalDTO> reviewStudentApproval(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request) {
        return ResponseEntity.ok(adminService.reviewStudentApproval(id, request.status()));
    }

    @DeleteMapping("/lost/{id}")
    public ResponseEntity<Void> deleteLostReport(@PathVariable Long id) {
        adminService.deleteLostItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/found/{id}")
    public ResponseEntity<Void> deleteFoundReport(@PathVariable Long id) {
        adminService.deleteFoundItem(id);
        return ResponseEntity.noContent().build();
    }
}
