package com.fly.webchat.controller;

import lombok.Data;

//表示一个消息的响应
@Data
public class MessageResponse {
    private String type = "message";
    private Integer fromId;
    private String fromName;
    private Integer sessionId;
    private String content;
}
