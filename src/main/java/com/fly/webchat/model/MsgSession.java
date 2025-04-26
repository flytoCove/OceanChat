package com.fly.webchat.model;

import jakarta.servlet.http.HttpSession;
import lombok.Data;

import java.util.List;

@Data
public class MsgSession {
    private Integer sessionId;
    private List<FriendInfo> friendList;
    private String lastMsg;  //最后一条消息
}
