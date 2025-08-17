package com.dev.alleon.mappers.notice;

import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.vos.PageVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface NoticeMapper {
    NoticeEntity[] selectAll(@Param(value = "pageVo") PageVo pageVo);

    int selectAllNotice();

    int insert(@Param(value = "notice") NoticeEntity notice);

    NoticeEntity selectByIndex(@Param(value = "index") int index);

    int increaseView(@Param(value = "index") int index);
}
