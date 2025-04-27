package com.fly.webchat.service;

import com.fly.webchat.mapper.FriendInfoMapper;
import com.fly.webchat.mapper.UserInfoMapper;
import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.model.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class FriendService {

    @Autowired
    private FriendInfoMapper friendInfoMapper;
    @Autowired
    private UserInfoMapper userInfoMapper;

    //获取好友列表
    public ResponseEntity<List<FriendInfo>> getFriendList(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            //说明用户未登录 返回一个空对象列表
            log.info(" session not null");
            return ResponseEntity.badRequest().body(new ArrayList<FriendInfo>());
        }
        UserInfo user = (UserInfo) session.getAttribute("user");
        if (user == null) {
            log.info(" user not exist");
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }

        List<FriendInfo> friendInfoList = friendInfoMapper.getFriendList(user.getUserId());
        return ResponseEntity.ok().body(friendInfoList);
    }

    public ResponseEntity<Object> addFriend(Integer friendId,HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        UserInfo user = (UserInfo) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Integer ret = userInfoMapper.addFriend(user.getUserId(), friendId);
        if(ret == 0){
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok().body("success");
    }
}
