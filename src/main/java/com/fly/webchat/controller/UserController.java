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
@RequestMapping("/user")
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
        if (user.getId() != null) {
            HttpSession session = req.getSession();
            session.setAttribute("user", user);
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "userInfo", Map.of("username", username)
                    ));
        }
        //密码和账号都匹配不上返回错误
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

    //获取用户登录状态
    @RequestMapping("/getUserInfo")
    public ResponseEntity<UserInfo> getUserInfo(HttpServletRequest request) {
        return userService.getUserInfo(request);
    }
}
