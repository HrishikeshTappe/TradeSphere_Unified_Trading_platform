package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.service.EmailService;
import com.tradesphere.tradepherebackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @PostMapping("/set")
    public Map<String, String> setAlert(@RequestBody Map<String, String> payload) {
        String symbol = payload.get("symbol");
        String targetPrice = payload.get("price");

        // In a real app, you would save this alert to the database
        // For now, we will just trigger an email confirmation

        var user = userService.getDemoUser(); // Assuming there's a demo user or logged in user logic
        String userEmail = user.getEmail();

        emailService.sendAlertEmail(userEmail, symbol, targetPrice);

        return Map.of("message", "Alert set successfully for " + symbol + " at $" + targetPrice);
    }
}
