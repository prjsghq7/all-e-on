package com.dev.alleon.vos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ArticleSearchVo {
    private SearchType searchType;
    private String keyword;

    private enum SearchType {
        title,
        content,
        author
    }
}
