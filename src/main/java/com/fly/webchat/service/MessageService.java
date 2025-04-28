package com.fly.webchat.service;

import com.fly.webchat.mapper.MessageMapper;
import com.fly.webchat.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageMapper messageMapper;
    public List<Message> searchMsgBySessionId(Integer sessionId) {
        //如果没有会话直接返回空列表
        if(sessionId == null){
            return null;
        }

        List<Message> messages = messageMapper.searchMsgBySessionId(sessionId);
        Collections.reverse(messages);
        return messages;
    }

}
