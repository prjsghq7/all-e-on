package com.dev.alleon.dtos.Comment;

import com.dev.alleon.vos.PageVo;
import lombok.*;

import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CommentsResponse {
    List<CommentDto> comments;
    PageVo pageVo;
}
