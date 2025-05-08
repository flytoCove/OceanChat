package com.fly.webchat.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class OnlineUserManage {
    // 通过哈希表进行映射
    private final ConcurrentHashMap<Integer, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // 1.用户上线插入键值对
    public void onlineUser(Integer userId, WebSocketSession session) {
        if(sessions.get(userId) != null) {
            //如果用户已登录移除之前的登录
            offlineUser(userId, session);
        }
        sessions.put(userId, session);

        log.info("User online:{}",userId);

    }


    // 2.用户下线删除键值对
    public void offlineUser(Integer userId, WebSocketSession session) {
        sessions.remove(userId);
    }

    // 3.根据 userId 获取到 WebSocketSession
    public WebSocketSession getSession(Integer userId) {
        return sessions.get(userId);
    }
}
