package com.dev.alleon.dtos.article;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class ArticleDto {
    private int index;
    private int userIndex;
    private String title;
    private String content;
    private int view;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isDeleted;
    private String welfareId;

    String nickname;
}
