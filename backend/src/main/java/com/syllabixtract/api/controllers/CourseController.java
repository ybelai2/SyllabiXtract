package com.syllabixtract.api.controllers;

import com.syllabixtract.api.repositories.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CourseController {
    @Autowired
    private CourseRepository courseRepository;

}
