package com.dev.alleon.entities.article;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class CommentEntity {
    private Integer index;
    private Integer userIndex;
    private Integer articleIndex;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private boolean isDeleted;
}
