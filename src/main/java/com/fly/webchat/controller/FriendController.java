package com.fly.webchat.controller;

import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.service.FriendService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FriendController {
    @Autowired
    private FriendService friendService;
    @RequestMapping("/friendList")
    public ResponseEntity<List<FriendInfo>> getFriendList(HttpServletRequest request) {
        return friendService.getFriendList(request);
    }
}
