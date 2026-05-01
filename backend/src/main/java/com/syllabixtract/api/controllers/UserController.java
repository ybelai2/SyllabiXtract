package com.syllabixtract.api.controllers;


import com.syllabixtract.api.domain.dto.UserSyncRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.syllabixtract.api.services.UserService;
import com.syllabixtract.api.domain.dto.UserSyncRequest;

@RestController
@RequestMapping
public class UserController {

    private final UserService userService;
    @Value("${api.secret}")
    private String apiSecret;

    public UserController(UserService userService) {
        this.userService = userService;
    }





    @PostMapping("/api/public/users/sync")
    public ResponseEntity<?> syncUser(
            @RequestBody UserSyncRequest request,
            @RequestHeader("x-api-secret") String secret) {

        if (!secret.equals(apiSecret)) {
            return ResponseEntity.status(403).build();
        }

        userService.syncUser(request);
        return ResponseEntity.ok().build();
    }
}
