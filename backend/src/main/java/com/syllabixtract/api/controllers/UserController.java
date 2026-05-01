package com.syllabixtract.api.controllers;

import com.syllabixtract.api.services.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class UserController {

    private final UserServiceImpl userServiceImpl;
    @Value("${api.secret}")
    private String apiSecret;

    public UserController(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }





    @PostMapping("/api/public/users/sync")
    public ResponseEntity<?> syncUser(
            @RequestBody UserSyncRequest request,
            @RequestHeader("x-api-secret") String secret) {

        if (!secret.equals(apiSecret)) {
            return ResponseEntity.status(403).build();
        }

        userServiceImpl.syncUser(request);
        return ResponseEntity.ok().build();
    }
}
