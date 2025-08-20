package com.dev.alleon.entities.notice;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "index")
public class ImageEntity {
    private int index;
    private String name;
    private String contentType;
    private LocalDateTime createdAt;
    private byte[] data;
}
