package com.dev.alleon.entities.notice;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class NoticeEntity {
    private int index;
    private int userIndex;
    private String title;
    private String content;
    private int view;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isDeleted;
}
