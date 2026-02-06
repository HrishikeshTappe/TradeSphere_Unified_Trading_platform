package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.dto.AuthRequest;
import com.tradesphere.tradepherebackend.dto.AuthResponse;
import com.tradesphere.tradepherebackend.model.User;
import com.tradesphere.tradepherebackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        System.out.println("DEBUG: AuthController reached for registration of " + user.getEmail());
        String response = userService.register(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest authRequest) {
        AuthResponse response = userService.authenticate(authRequest);
        return ResponseEntity.ok(response);
    }
}
