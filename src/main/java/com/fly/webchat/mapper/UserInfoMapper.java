package com.fly.webchat.mapper;

import com.fly.webchat.model.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

@Mapper
public interface UserInfoMapper {
    @Options(useGeneratedKeys = true,keyProperty = "userId")
    @Insert("INSERT INTO user_info(`username`,`password`) " +
            "values(#{username},#{password});")
    Integer insertUserInfo(UserInfo userInfo);

    @Select("SELECT * FROM user_info where username = #{username}")
    UserInfo queryUserInfo(String username);

    //查询是否存在此用户
    UserInfo searchUserByUserName(String username);

    //添加好友
    Integer addFriend(Integer userId,Integer friendId);
}
