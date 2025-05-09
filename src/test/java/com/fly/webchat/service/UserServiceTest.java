package com.fly.webchat.service;

import com.fly.webchat.model.UserInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;

    @Test
    public void insertUserInfo() {
        UserInfo userInfo = new UserInfo();
        userInfo.setUsername("admin");
        userInfo.setPassword("123456");
        System.out.println(userService.insertUserInfo(userInfo.getUsername(), userInfo.getPassword()));
    }
}