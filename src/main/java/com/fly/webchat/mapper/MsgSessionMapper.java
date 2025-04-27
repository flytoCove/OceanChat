package com.fly.webchat.mapper;

import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.model.MsgSession;
import com.fly.webchat.model.MsgSessionItem;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MsgSessionMapper {
    // 通过当前登录用户查询当前用户所在的所有会话集合
    List<Integer> getSessionsIdByUserId(Integer userId);

    // 根据查询到的 sessionId 再去查询会话中包含那些好友（需排除自己）
    List<FriendInfo> getFriendListBySessionId(Integer sessionId, Integer selfUserId);

    //查询当前会话是否存在
    Integer querySessionIsExists(Integer sessionId);

    // 1.新增一个会话记录
    Integer addSession(MsgSession msgSession);

    // 2.在 msg_session_user 增加相应的记录
    Integer addSessionItem(MsgSessionItem msgSessionItem);

    // 删除会话
    Integer deleteSession(Integer sessionId);

    //删除对应的记录
    Integer deleteSessionItem(Integer sessionId, Integer itemId);
}
