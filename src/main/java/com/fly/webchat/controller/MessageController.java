package com.fly.webchat.controller;

import com.fly.webchat.mapper.MessageMapper;
import com.fly.webchat.model.Message;
import com.fly.webchat.model.UserInfo;
import com.fly.webchat.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @RequestMapping("/searchMsgBySessionId")
    public List<Message>searchMsgBySessionId(@RequestBody Map<String,Integer> map, HttpServletRequest request) {
        HttpSession session = request.getSession();

        log.info("searchMsgBySessionId:{}", map.get("sessionId"));

        if(session == null){
            return null;
        }

        UserInfo user = (UserInfo) session.getAttribute("user");
        if(user == null){
            return null;
        }
        Integer sessionId = map.get("sessionId");
        return messageService.searchMsgBySessionId(sessionId);
    }
}
