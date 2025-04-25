package com.fly.webchat.controller;

import com.fly.webchat.model.UserInfo;
import com.fly.webchat.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    // 登录接口
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpServletRequest req) {
        String username = request.get("username");
        String password = request.get("password");

        // 参数校验
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "用户名和密码不能为空"));
        }


        // 假设userService有一个验证用户的方法
        UserInfo user = (UserInfo) userService.login(username, password, req);

        if (user.getId() != null) {
            // 生成token (实际项目中应该用JWT等机制)
            String token = UUID.randomUUID().toString();
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "token", token,
                            "userInfo", Map.of("username", username)
                    ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", "用户名或密码错误"));

    }


    // 注册接口
    @RequestMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        // 参数校验
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "用户名和密码不能为空"));
        }


        UserInfo result = (UserInfo) userService.insertUserInfo(username, password);
        if (result.getId() != null) {
            return ResponseEntity.ok()
                    .body(Map.of("success", true, "data", result));
        }

        return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "注册失败: "));

    }
}
