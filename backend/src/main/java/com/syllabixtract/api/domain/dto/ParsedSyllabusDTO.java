package com.syllabixtract.api.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class ParsedSyllabusDTO {
    private String course_code;
    private String course_name;
    private List<DeadlineDto> deadlines;
}