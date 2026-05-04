package com.syllabixtract.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syllabixtract.api.domain.dto.ParsedSyllabusDTO;
import com.syllabixtract.api.domain.entities.*;
import com.syllabixtract.api.repositories.*;
import com.syllabixtract.api.services.GeminiService;
import com.syllabixtract.api.services.LlamaParseService;
import com.syllabixtract.api.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private final LlamaParseService llamaParseService;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final SyllabiRepository syllabiRepository;
    private final CourseRepository coursesRepository;
    private final DeadlineRepository deadlineRepository;
    private final ParseJobRepository parseJobRepository;

    @GetMapping("/")
    public Map<String, String> healthCheck() {
        return Map.of("message", "SyllabiXtract Java Backend is running!");
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> handleUpload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }

        System.out.println("--- Starting New Upload: " + file.getOriginalFilename() + " ---");
        Map<String, Object> response = new HashMap<>();

        try {
            // Get the logged-in user — create them on the fly if the sync hasn't happened
            // yet
            String auth0Id = authentication.getName();
            UserEntity user = userRepository.findByAuth0Id(auth0Id)
                    .orElseGet(() -> {
                        System.out.println("JIT User Creation for: " + auth0Id);
                        UserEntity newUser = UserEntity.builder()
                                .auth0Id(auth0Id)
                                .email("pending-sync@syllabixtract.com")
                                .created_at(LocalDateTime.now())
                                .build();
                        return userRepository.save(newUser);
                    });

            // Save syllabi record
            SyllabiEntity syllabi = SyllabiEntity.builder()
                    .file_name(file.getOriginalFilename())
                    .file_type(file.getContentType())
                    .uploaded_at(LocalDateTime.now())
                    .is_parsed(false)
                    .build();
            syllabiRepository.save(syllabi);

            // Create parse job with PENDING status
            ParseJobEntity parseJob = ParseJobEntity.builder()
                    .syllabiEntity(syllabi)
                    .status("PENDING")
                    .started_at(LocalDateTime.now())
                    .retry_count(0)
                    .build();
            parseJobRepository.save(parseJob);

            // Step 1: LlamaParse
            System.out.println("Step 1: Sending to LlamaParse...");
            String rawSyllabusText = llamaParseService.parseDocument(file);
            syllabi.setRaw_text(rawSyllabusText);
            syllabiRepository.save(syllabi);

            // Step 2: Gemini
            System.out.println("Step 2: Sending to Gemini...");
            String structuredJsonData = geminiService.extractScheduleAsJson(rawSyllabusText);

            ObjectMapper mapper = new ObjectMapper();
            ParsedSyllabusDTO parsed = mapper.readValue(structuredJsonData, ParsedSyllabusDTO.class);

            // Save course
            CourseEntity course = CourseEntity.builder()
                    .user(user)
                    .course_code(parsed.getCourse_code())
                    .course_name(parsed.getCourse_name())
                    .created_at(LocalDateTime.now())
                    .build();
            coursesRepository.save(course);

            // Link syllabi to course
            syllabi.setCourse(course);
            syllabi.setIs_parsed(true);
            syllabiRepository.save(syllabi);

            // Save each deadline
            if (parsed.getDeadlines() != null) {
                for (var d : parsed.getDeadlines()) {
                    LocalDate dueDate = null;
                    LocalTime dueTime = null;

                    if (d.getDue_date() != null && !d.getDue_date().equals("null") && !d.getDue_date().isEmpty()) {
                        dueDate = LocalDate.parse(d.getDue_date());
                    }
                    if (d.getDue_time() != null && !d.getDue_time().equals("null") && !d.getDue_time().isEmpty()) {
                        dueTime = LocalTime.parse(d.getDue_time());
                    }

                    DeadlineEntity deadline = DeadlineEntity.builder()
                            .syllabiEntity(syllabi)
                            .courseEntity(course)
                            .title(d.getTitle())
                            .description(d.getDescription())
                            .due_date(dueDate)
                            .due_time(dueTime)
                            .is_confirmed(false)
                            .is_completed(false)
                            .build();
                    deadlineRepository.save(deadline);
                }
            }

            // Mark parse job as complete
            parseJob.setStatus("COMPLETE");
            parseJob.setCompleted_at(LocalDateTime.now());
            parseJobRepository.save(parseJob);

            System.out.println("Step 3: Processing complete.");
            response.put("status", "success");
            response.put("filename", file.getOriginalFilename());
            response.put("message", "File processed successfully!");
            response.put("events", parsed);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR DURING UPLOAD: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Failed to process document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}