package com.fly.webchat.model;

import lombok.Data;

import java.util.Date;

@Data
public class Message {
    private Integer messageId;
    private Integer fromId;
    private String fromName;
    private String sessionId;
    private String content;
    private Date postTime;
}
