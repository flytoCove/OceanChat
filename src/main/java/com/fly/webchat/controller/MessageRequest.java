package com.fly.webchat.controller;

import lombok.Data;

// 表示一个消息请求
@Data
public class MessageRequest {
    private String type = "message";
    private Integer sessionId;
    private String content;
}
