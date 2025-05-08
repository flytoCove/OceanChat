package com.fly.webchat.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fly.webchat.component.OnlineUserManage;
import com.fly.webchat.mapper.MessageMapper;
import com.fly.webchat.mapper.MsgSessionMapper;
import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.model.Message;
import com.fly.webchat.model.UserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class WebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private MessageMapper messageMapper;
    private ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private MsgSessionMapper msgSessionMapper;
    @Autowired
    private OnlineUserManage onlineUserManage;

    @Override
    // websocket 建立链接成功之后自动调用
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UserInfo user = (UserInfo) session.getAttributes().get("user");
        if(user == null) {
            return;
        }
        onlineUserManage.onlineUser(user.getUserId(), session);
        System.out.println("连接成功");
    }

    @Override
    //websocket 收到消息之后自动调用
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        //session 持有websocket的通信连接（记录了通信双方）
        // 1.获取用户信息
        UserInfo user = (UserInfo) session.getAttributes().get("user");
        if(user == null) {
            log.info("handleTextMessage: user is null");
            return;
        }
        // 2.消息解析 将 json 转成 Java 对象
        MessageRequest req = objectMapper.readValue(message.getPayload(), MessageRequest.class);
        if(req.getType().equals("message")) {
            // 消息转发
            transferMessage(user,req);
        }else{
            log.info("rep.type有误：{}", req.getType());
        }

    }

    //完成消息转发
    private void transferMessage(UserInfo fromUser, MessageRequest req) throws IOException {
        // 1.先构造一个待转发的 ResponseMessage
        MessageResponse resp = new MessageResponse();
        resp.setType("message"); // 可以不用设置默认就是
        resp.setFromId(fromUser.getUserId());
        resp.setFromName(fromUser.getUsername());
        resp.setSessionId(req.getSessionId());
        resp.setContent(req.getContent());

        String respJson = objectMapper.writeValueAsString(resp);
        log.info("MessageResponse:{}",respJson);
        // 2.根据请求中的 sessionId 获取到会话中的用户
        List<FriendInfo> friends = msgSessionMapper.getFriendListBySessionId(req.getSessionId(),fromUser.getUserId());
        //将自己也需要添加进去
        FriendInfo myself = new FriendInfo();
        myself.setFriendId(fromUser.getUserId());
        myself.setFriendName(fromUser.getUsername());
        friends.add(myself);
        // 3.将 ResponseMessage 发送给这些用户（包括自己方便前端查看消息）
        for(FriendInfo friend : friends) {
            WebSocketSession webSocketSession = onlineUserManage.getSession(friend.getFriendId());
            if(webSocketSession == null) {
                continue;
            }
            webSocketSession.sendMessage(new TextMessage(respJson));
        }

        // 4，将转发的消息记录到数据库中方便后续查看历史消息
        Message message = new Message();
        message.setFromId(fromUser.getUserId());
        message.setSessionId(req.getSessionId());
        message.setContent(req.getContent());

        messageMapper.addMessage(message);
    }


    //出现异常之后自动调用
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        UserInfo user = (UserInfo) session.getAttributes().get("user");
        if(user == null) {
            return;
        }
        onlineUserManage.offlineUser(user.getUserId(), session);
    }

    //链接正常关闭后自动调用
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        UserInfo user = (UserInfo) session.getAttributes().get("user");
        if(user == null) {
            return;
        }
        onlineUserManage.offlineUser(user.getUserId(), session);
        System.out.println("连接关闭");
    }
}
