package com.fly.webchat.model;

import lombok.Data;

import java.util.Date;

@Data
public class UserInfo {
    private Integer userId;
    private String username;
    private String password;
    private Date createTime;
    private Date updateTime;
}
