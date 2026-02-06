package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.model.User;
import com.tradesphere.tradepherebackend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/profile")
    public User getProfile(Principal principal) {
        String email = principal.getName();
        return userService.findByEmail(email);
    }

    @PutMapping("/profile")
    public User updateProfile(@RequestBody User updatedUser, Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        user.setUsername(updatedUser.getUsername());
        // Add other fields here if needed, but not password/email for now
        return userService.save(user);
    }
}
