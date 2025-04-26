package com.fly.webchat.model;

import lombok.Data;
import org.springframework.stereotype.Component;

@Data
public class FriendInfo {
    private Integer friendId;
    private String friendName;
}
