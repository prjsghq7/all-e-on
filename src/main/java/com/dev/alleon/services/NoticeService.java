package com.dev.alleon.services;

import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.mappers.notice.NoticeMapper;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NoticeService {
    @Autowired
    private final NoticeMapper noticeMapper;

    public NoticeService(NoticeMapper noticeMapper) {
        this.noticeMapper = noticeMapper;
    }

    public Result add(UserEntity signedUser, NoticeEntity notice) {
        if (signedUser == null || notice == null) {
            return CommonResult.FAILURE_ABSENT;
        }
        notice.setUserIndex(signedUser.getIndex());
        notice.setCreatedAt(LocalDateTime.now());
        notice.setModifiedAt(null);
        notice.setDeleted(false);
        return this.noticeMapper.insert(notice) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public ResultTuple<NoticeEntity> getNotice(int index) {
        if (index < 0) {
            return ResultTuple.<NoticeEntity>builder()
                    .result(CommonResult.FAILURE).build();
        }

        NoticeEntity notice = this.noticeMapper.selectByIndex(index);
        if (notice == null) {
            return ResultTuple.<NoticeEntity>builder()
                    .result(CommonResult.FAILURE_ABSENT).build();
        }

        return ResultTuple.<NoticeEntity>builder()
                .payload(notice).result(CommonResult.SUCCESS).build();
    }

}
