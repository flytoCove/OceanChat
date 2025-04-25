package com.fly.webchat.service;

import com.fly.webchat.mapper.UserInfoMapper;
import com.fly.webchat.model.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class UserService {
    @Autowired
    private UserInfoMapper userInfoMapper;
    public Object insertUserInfo(String username, String password) {
        UserInfo newUser = null;
        try{
            newUser = new UserInfo();
            newUser.setUsername(username);
            newUser.setPassword(password);
            Integer ret = userInfoMapper.insertUserInfo(newUser);
            log.info("userInfo inserted successfully");
        }catch (DuplicateKeyException e){
            //如果抛出异常说明主键重复 返回空对象
            log.info("username already exists");
            newUser = new UserInfo();
        }
        newUser.setPassword("");
        return newUser;
    }

    public Object login(String username, String password, HttpServletRequest request) {
        UserInfo user = userInfoMapper.queryUserInfo(username);
        if(user == null || !user.getPassword().equals(password)) {
            log.info("login failed {}", user);
            return new UserInfo();
        }
        HttpSession session = request.getSession(true);
        session.setAttribute("user", user);
        user.setPassword("");
        return user;
    }

    public ResponseEntity<UserInfo> getUserInfo(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            log.info("session is null,user is not logged in");
            //返回一个空对象
            return ResponseEntity.badRequest().body(new UserInfo());
        }
        UserInfo user = (UserInfo) session.getAttribute("user");
        if (user == null) {
            log.info(" user is not logged in");
            return ResponseEntity.badRequest().body(new UserInfo());
        }
        user.setPassword("");
        return ResponseEntity.ok().body(user);
    }
}
