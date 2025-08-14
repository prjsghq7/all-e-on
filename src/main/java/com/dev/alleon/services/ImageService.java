package com.dev.alleon.services;

import com.dev.alleon.entities.UserEntity;
import com.dev.alleon.entities.notice.ImageEntity;
import com.dev.alleon.entities.notice.NoticeEntity;
import com.dev.alleon.mappers.images.ImageMapper;
import com.dev.alleon.results.CommonResult;
import com.dev.alleon.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ImageService {
    @Autowired
    private final ImageMapper imageMapper;

    public ImageService(ImageMapper imageMapper) {
        this.imageMapper = imageMapper;
    }

    public ImageEntity getByIndex(int index) {
        if (index < 0) {
            return null;
        }
        return this.imageMapper.selectByIndex(index);
    }

    public Result add(UserEntity signedUser, NoticeEntity notice, ImageEntity image) {
        System.out.println("image service");
        if (signedUser == null) {
            return CommonResult.FAILURE_ABSENT;
        }
        if (image == null ||
                image.getName() == null ||
                image.getData() == null ||
                image.getContentType() == null ||
                image.getData().length == 0) {
            return CommonResult.FAILURE;
        }
        image.setCreatedAt(LocalDateTime.now());
        return this.imageMapper.insert(image) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}
