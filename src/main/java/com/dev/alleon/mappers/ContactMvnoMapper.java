package com.dev.alleon.mappers;

import com.dev.alleon.entities.ContactMvnoEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContactMvnoMapper {
    ContactMvnoEntity[] selectAll();

    int selectCountByCode(String code);
}
