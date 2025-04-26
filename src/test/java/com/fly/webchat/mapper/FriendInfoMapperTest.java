package com.fly.webchat.mapper;

import com.fly.webchat.model.FriendInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class FriendInfoMapperTest {

    @Autowired
    private FriendInfoMapper friendInfoMapper;
    @Test
    void getFriendList() {
        List<FriendInfo> list = friendInfoMapper.getFriendList(1);
        System.out.println(list);
    }
}