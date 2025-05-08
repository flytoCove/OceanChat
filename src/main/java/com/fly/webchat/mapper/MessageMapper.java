package com.fly.webchat.mapper;

import com.fly.webchat.model.Message;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MessageMapper {
    // 查询指定会话的最后一条消息
    String searchhLastMsgBySessionId(Integer sessionId);

    //这里我指定只返回前100条消息记录
    List<Message> searchMsgBySessionId(Integer sessionId);

    Integer addMessage(Message message);
}
