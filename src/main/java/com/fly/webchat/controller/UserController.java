package com.fly.webchat.controller;

import com.fly.webchat.model.UserInfo;
import com.fly.webchat.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    // 登录接口
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpServletRequest req) {
        String username = request.get("username");
        String password = request.get("password");

        //前端已经限制用户名密码不能为空
        //可以查数据库看用户是否存在 密码是否正确 这里也可以做更多的参数校验
        UserInfo user = (UserInfo) userService.login(username, password, req);
        //如果账号和密码都匹配正确 则说明数据库中有此记录 id 不为空 返回 success
        if (user.getUserId() != null) {
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "userInfo", Map.of("id",user.getUserId(),"username", username)
                    ));
        }
        //说明没有查到用户或者密码错误返回了空对象
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "用户名或密码错误"));

    }


    // 注册接口
    @RequestMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        UserInfo result = (UserInfo) userService.insertUserInfo(username, password);
        if (result.getUserId() != null) {
            return ResponseEntity.ok()
                    .body(Map.of("success", true, "data", result));
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("success", false, "message", "fail : username already exists"));

    }

    //获取用户登录状态
    @RequestMapping("/userInfo")
    public ResponseEntity<UserInfo> getUserInfo(HttpServletRequest request) {
        return userService.getUserInfo(request);
    }
}
