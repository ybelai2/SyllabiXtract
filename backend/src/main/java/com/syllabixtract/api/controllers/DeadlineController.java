package com.syllabixtract.api.controllers;

import com.syllabixtract.api.repositories.DeadlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/deadlines")
@RequiredArgsConstructor
public class DeadlineController {

    private final DeadlineRepository deadlineRepository;

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDeadline(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        return deadlineRepository.findById(id).map(deadline -> {
            if (updates.containsKey("title")) {
                deadline.setTitle(updates.get("title"));
            }
            if (updates.containsKey("description")) {
                deadline.setDescription(updates.get("description"));
            }
            if (updates.containsKey("due_date")) {
                String dateStr = updates.get("due_date");
                deadline.setDue_date(dateStr != null && !dateStr.isEmpty() ? LocalDate.parse(dateStr) : null);
            }
            deadlineRepository.save(deadline);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDeadline(@PathVariable Long id) {
        if (deadlineRepository.existsById(id)) {
            deadlineRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}