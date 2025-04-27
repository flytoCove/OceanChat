package com.fly.webchat.controller;

import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.service.FriendService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class FriendController {
    @Autowired
    private FriendService friendService;
    @RequestMapping("/friendList")
    public ResponseEntity<List<FriendInfo>> getFriendList(HttpServletRequest request) {
        return friendService.getFriendList(request);
    }

    @RequestMapping("/addFriend")
    public ResponseEntity<Object> addFriend(@RequestBody Map<String,Integer> map, HttpServletRequest request) {
        Integer friendId = map.get("friendId");
        log.info("addFriend:{}",friendId);
        if(friendId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return friendService.addFriend(friendId,request);
    }
}
