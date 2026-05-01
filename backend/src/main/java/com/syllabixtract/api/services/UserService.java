package com.syllabixtract.api.services;

import com.syllabixtract.api.domain.dto.UserSyncRequest;

public interface UserService {
    void syncUser(UserSyncRequest request);
}
