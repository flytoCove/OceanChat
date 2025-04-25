package com.fly.webchat.mapper;

import com.fly.webchat.model.UserInfo;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserInfoMapper {
    @Options(useGeneratedKeys = true,keyProperty = "id")
    @Insert("INSERT INTO user_info(`username`,`password`) " +
            "values(#{username},#{password});")
    Integer insertUserInfo(UserInfo userInfo);

    @Select("SELECT * FROM user_info where username = #{username}")
    UserInfo queryUserInfo(String username);
}
