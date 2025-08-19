package com.dev.alleon.mappers.welfare;

import com.dev.alleon.dtos.welfare.WelfareFavoriteDto;
import com.dev.alleon.entities.welfare.WelfareLikesEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface WelfareLikesMapper {
    int delete(@Param(value = "welfareId") String welfareId,
               @Param(value = "userIndex") int userIndex);

    int insert(@Param(value = "welfareLikes") WelfareLikesEntity welfareLikesEntity);

    int updateAlarmAt(@Param(value = "welfareId") String welfareId,
                      @Param(value = "userIndex") int userIndex,
                      @Param(value = "alarmAt") LocalDate alarmAt);

    int selectCountByWelfareIdAndUserIndex(@Param(value = "welfareId") String welfareId,
                                           @Param(value = "userIndex") int userIndex);

    WelfareLikesEntity selectByWelfareIdAndUserIndex(@Param(value = "welfareId") String welfareId,
                                                     @Param(value = "userIndex") int userIndex);

    WelfareFavoriteDto[] selectAllByUser(@Param(value = "userIndex") int userIndex);


    WelfareFavoriteDto selectAlarmByWelfareIdAndUser(@Param(value = "welfareId") String welfareId,
                                                     @Param(value = "userIndex") int userIndex);

    WelfareFavoriteDto[] selectAllAlarmByUser(@Param(value = "userIndex") int userIndex);

    WelfareFavoriteDto[] selectAllHomeAlarmByUser(@Param(value = "userIndex") int userIndex);
}
