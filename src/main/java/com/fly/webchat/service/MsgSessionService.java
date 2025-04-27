package com.fly.webchat.service;

import com.fly.webchat.mapper.MsgSessionMapper;
import com.fly.webchat.model.FriendInfo;
import com.fly.webchat.model.MsgSession;
import com.fly.webchat.model.MsgSessionItem;
import com.fly.webchat.model.UserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MsgSessionService {
    @Autowired
    private MsgSessionMapper msgSessionMapper;

    //会话列表
    public ResponseEntity<List<MsgSession>> getMsgSessionList(HttpServletRequest request){
        HttpSession session = request.getSession();
        List<MsgSession> msgSessionList = new ArrayList<>();

        //如果用户未登录返回空列表
        if(session == null){
            log.info("user is not logged in");
            return new ResponseEntity<>(msgSessionList, HttpStatus.UNAUTHORIZED);
        }
        UserInfo user = (UserInfo)session.getAttribute("user");
        if(user == null){
            log.info("user is not logged in");
            return new ResponseEntity<>(msgSessionList, HttpStatus.UNAUTHORIZED);
        }

        //通过当前登录用户查询用户所在的 SessionId
        List<Integer> sessionIdList = msgSessionMapper.getSessionsIdByUserId(user.getUserId());

        //如果当前用户没有任何会话返回空
        if(sessionIdList == null){
            log.info("current user is not session");
            return new ResponseEntity<>(msgSessionList, HttpStatus.UNAUTHORIZED);
        }
        //遍历查询每个sessionId对应的好友信息（排除自己）
        for(Integer sessionId : sessionIdList){
            //
            MsgSession msgSession = new MsgSession();
            msgSession.setSessionId(sessionId);
            List<FriendInfo> friendInfoList = msgSessionMapper.getFriendListBySessionId(sessionId, user.getUserId());
            msgSession.setFriendList(friendInfoList);
            msgSession.setLastMsg("Why baby why tell me");
            msgSessionList.add(msgSession);
        }
        return new ResponseEntity<>(msgSessionList, HttpStatus.OK);
    }

    // toUserId 表示将哪个好友和当前登录的用户添加到一个会话列表
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<Map<String,Object>> addMsgSession(Integer toUserId, HttpServletRequest request){
        HttpSession session = request.getSession();
        if(session == null){
            log.info("user not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "fail : username not logged in"));
        }

        UserInfo user = (UserInfo) session.getAttribute("user");

        if(user == null){
            log.info("user not logged in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "fail : username not logged in"));
        }

        Integer ret = msgSessionMapper.querySessionIsExists(toUserId);
        log.info("query session id is {}", ret);
        if(ret != null){
            log.info("session already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "fail : session already exists"));
        }

        // 1.msg_session 中插入数据
        MsgSession msgSession = new MsgSession();
        msgSessionMapper.addSession(msgSession);

        // 2.msg_session_user 表中添加 (自增主键, userId)
        MsgSessionItem item1 = new MsgSessionItem();
        item1.setSessionId(msgSession.getSessionId());
        item1.setUserId(user.getUserId());
        msgSessionMapper.addSessionItem(item1);

        // 3.msg_session_user 表中添加 (自增主键, toUserId)
        MsgSessionItem item2 = new MsgSessionItem();
        item2.setSessionId(msgSession.getSessionId());
        item2.setUserId(toUserId);
        msgSessionMapper.addSessionItem(item2);
        return ResponseEntity.ok()
                .body(Map.of("sessionId",msgSession.getSessionId()));
    }

//    public ResponseEntity<Integer> deleteMsgSession(MsgSession msgSession){
//
//    }
}
