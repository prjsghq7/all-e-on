package com.dev.alleon.entities.welfare;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class WelfareLikesEntity {
    private int index;
    private String welfareId;
    private int userIndex;
    private LocalDate alarmAt;
    private LocalDateTime createdAt;
}
