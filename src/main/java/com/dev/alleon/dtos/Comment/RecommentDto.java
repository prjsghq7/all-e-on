package com.dev.alleon.dtos.Comment;

import lombok.*;
import org.checkerframework.checker.units.qual.N;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class RecommentDto {
    private Integer index;
    private String content;
    private String nickname;
    private byte[] profile;
    private LocalDateTime createdAt;

    private boolean isMine;
}
