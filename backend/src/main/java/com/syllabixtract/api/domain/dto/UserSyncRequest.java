package com.syllabixtract.api.domain.dto;

import lombok.Data;

@Data
public class UserSyncRequest {

        private String email;
        private String firstName;
        private String lastName;
        private String auth0Id;
    }


