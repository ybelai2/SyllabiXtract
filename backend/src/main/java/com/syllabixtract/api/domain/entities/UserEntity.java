package com.syllabixtract.api.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table (name = "users")
public class UserEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(unique = true)
    private String auth0Id;

    private String first_name;
    private String last_name;


    @Column (nullable = false, unique = true)
    private String email;

    @Column (updatable = false)
    private LocalDateTime created_at ;

    @PrePersist
    public void onCreate(){
        this.created_at = LocalDateTime.now();
    }
}
