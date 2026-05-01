package com.syllabixtract.api.services;

import com.syllabixtract.api.controllers.UserSyncRequest;
import com.syllabixtract.api.domain.entities.UserEntity;
import com.syllabixtract.api.repositories.UserRepository;

import java.time.LocalDateTime;

public interface UserService {
    void syncUser(UserSyncRequest request);
}
