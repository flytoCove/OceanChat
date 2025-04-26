package com.fly.webchat.mapper;

import com.fly.webchat.model.FriendInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MsgSessionMapperTest {

    @Autowired
    private MsgSessionMapper msgSessionMapper;
    @Test
    void getSessionsIdByUserId() {
        List<Integer> sessions = msgSessionMapper.getSessionsIdByUserId(1);
        System.out.println(sessions);
    }

}