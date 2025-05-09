package com.fly.webchat.controller;

import com.fly.webchat.model.MsgSession;
import com.fly.webchat.model.MsgSessionItem;
import com.fly.webchat.model.UserInfo;
import com.fly.webchat.service.MsgSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class MsgSessionController {
    @Autowired
    private MsgSessionService msgSessionService;
    @RequestMapping("/MsgSessionList")
    public ResponseEntity<List<MsgSession>> getMsgSessionList(HttpServletRequest request){
        return msgSessionService.getMsgSessionList(request);
    }

    @RequestMapping("/addMsgSession")
    // @SessionAttribute("user") UserInfo user
    public ResponseEntity<Map<String,Object>> addMsgSession(@RequestBody Map<String,Integer> map, HttpServletRequest request){
        //toUserId表示将哪个好友和当前登录的用户添加到一个会话列表
        try{
            Integer toUserId = map.get("friendId");
            return msgSessionService.addMsgSession(toUserId, request);
        }catch (Exception e){
            return ResponseEntity.badRequest().body(null);
        }
    }
    @RequestMapping("/deleteMsgSession")
    public ResponseEntity<Map<String,Object>> deleteMsgSession(@RequestBody Map<String,Integer> map, HttpServletRequest request){
        log.info("deleteMsgSession,map = {}",map.toString());
        log.info(map.toString());
        Integer sessionId = map.get("currentSessionId");
        return msgSessionService.deleteMsgSession(sessionId,request);
    }
}
