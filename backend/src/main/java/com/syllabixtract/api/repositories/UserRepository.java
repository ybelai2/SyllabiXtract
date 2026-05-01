package com.syllabixtract.api.repositories;

import com.syllabixtract.api.domain.entities.UserEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UserRepository extends CrudRepository<UserEntity, Long> {
    Optional<UserEntity> findByAuth0Id(String auth0Id);
}
