package com.syllabixtract.api.services.impl;

import com.syllabixtract.api.controllers.UserSyncRequest;
import com.syllabixtract.api.domain.entities.UserEntity;
import com.syllabixtract.api.repositories.UserRepository;
import com.syllabixtract.api.services.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void syncUser(UserSyncRequest request) {


        userRepository.findByAuth0Id(request.getAuth0Id())
                .ifPresentOrElse(
                        existingUser -> {
                            // User exists, update their info in case they changed name/email
                            existingUser.setEmail(request.getEmail());
                            existingUser.setFirst_name(request.getFirstName());
                            existingUser.setLast_name(request.getLastName());
                            userRepository.save(existingUser);
                        },
                        () -> {
                            // New user, create them
                            UserEntity newUser = UserEntity.builder()
                                    .auth0Id(request.getAuth0Id())
                                    .email(request.getEmail())
                                    .first_name(request.getFirstName())
                                    .last_name(request.getLastName())
                                    .created_at(LocalDateTime.now())
                                    .build();
                            userRepository.save(newUser);
                        }
                );
    }
}
