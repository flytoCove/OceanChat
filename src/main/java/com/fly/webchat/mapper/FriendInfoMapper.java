package com.fly.webchat.mapper;

import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.model.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FriendInfoMapper {
    List<FriendInfo> getFriendList(Integer userId);
}
