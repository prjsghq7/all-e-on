package com.dev.alleon.services;

import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.mappers.notice.NoticeMapper;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import com.dev.alleon.results.ResultTuple;
import com.dev.alleon.vos.PageVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NoticeService {
    private static final int NUMBER_OF_ROWS = 10;
    @Autowired
    private final NoticeMapper noticeMapper;

    private Result incrementView(int index) {
        if (index < 0) {
            return CommonResult.FAILURE;
        }
        NoticeEntity dbNotice = this.noticeMapper.selectByIndex(index);
        if (dbNotice == null || dbNotice.isDeleted()) {
            return CommonResult.FAILURE_DOESNT_EXIST;
        }
        return this.noticeMapper.increaseView(index) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public NoticeService(NoticeMapper noticeMapper) {
        this.noticeMapper = noticeMapper;
    }

    public Result add(UserEntity signedUser, NoticeEntity notice) {
        if (signedUser == null || notice == null
                || signedUser.getActiveState() > 1) {
            return CommonResult.FAILURE_ABSENT;
        }

        notice.setUserIndex(signedUser.getIndex());
        notice.setCreatedAt(LocalDateTime.now());
        notice.setModifiedAt(null);
        notice.setDeleted(false);
        notice.setView(0);
        return this.noticeMapper.insert(notice) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }


    public ResultTuple<NoticeEntity> getNotice(int index) {
        if (index < 0) {
            return ResultTuple.<NoticeEntity>builder()
                    .result(CommonResult.FAILURE).build();
        }
        this.incrementView(index);
        NoticeEntity dbNotice = this.noticeMapper.selectByIndex(index);
        if (dbNotice == null) {
            return ResultTuple.<NoticeEntity>builder()
                    .result(CommonResult.FAILURE_DOESNT_EXIST).build();
        }

        return ResultTuple.<NoticeEntity>builder()
                .payload(dbNotice).result(CommonResult.SUCCESS).build();
    }

    public PageVo page(int page) {
        int totalCount = this.noticeMapper.selectAllNotice();
        return new PageVo(NUMBER_OF_ROWS, page, totalCount);
    }

    public ResultTuple<NoticeEntity[]> getAllNotice(PageVo pageVo) {
        NoticeEntity[] dbNotice = this.noticeMapper.selectAll(pageVo);
        return ResultTuple.<NoticeEntity[]>builder()
                .result(CommonResult.SUCCESS)
                .payload(dbNotice)
                .build();
    }

    public Result modify(UserEntity signedUser, NoticeEntity notice) {
        if (notice.getIndex() <= 0) {
            return CommonResult.FAILURE;
        }
        if (signedUser == null || signedUser.getActiveState() >= 2) {
            return CommonResult.FAILURE_ABSENT;
        }
        NoticeEntity dbNotice = this.noticeMapper.selectByIndex(notice.getIndex());
        if (dbNotice == null || dbNotice.isDeleted()) {
            return CommonResult.FAILURE_DOESNT_EXIST;
        }
        dbNotice.setModifiedAt(LocalDateTime.now());
        dbNotice.setContent(notice.getContent());
        dbNotice.setTitle(notice.getTitle());
        dbNotice.setDeleted(false);
        return this.noticeMapper.update(dbNotice) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public Result delete(UserEntity signedUser, int index) {
        if (signedUser == null || index < 0) {
            return CommonResult.FAILURE_ABSENT;
        }
        if (signedUser.getActiveState() >= 1) {
            return CommonResult.FAILURE;
        }
        NoticeEntity dbNotice = this.noticeMapper.selectByIndex(index);
        if (dbNotice == null || dbNotice.isDeleted()) {
            return CommonResult.FAILURE_DOESNT_EXIST;
        }
        dbNotice.setDeleted(true);
        dbNotice.setModifiedAt(LocalDateTime.now());
        return this.noticeMapper.update(dbNotice) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

}
