package com.dev.alleon.dtos.Comment;

import com.dev.alleon.entities.article.CommentEntity;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class CommentDto {
    private int index;
    private String content;
    private LocalDateTime createdAt;
    private String nickname;
    private byte[] profileImage;

    private boolean isMine;
}
