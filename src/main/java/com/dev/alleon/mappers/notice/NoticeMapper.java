package com.dev.alleon.mappers.notice;

import com.dev.alleon.entities.notice.NoticeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NoticeMapper {
    NoticeEntity selectAll();

    int insert(@Param(value = "notice") NoticeEntity notice);

    NoticeEntity selectByIndex(@Param(value = "index") int index);
}
