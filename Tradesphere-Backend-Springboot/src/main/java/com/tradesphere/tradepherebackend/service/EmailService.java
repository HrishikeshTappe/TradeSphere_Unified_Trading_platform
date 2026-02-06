package com.tradesphere.tradepherebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:unknown@example.com}")
    private String fromEmail;

    public void sendAlertEmail(String to, String objectName, String targetPrice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Price Alert: " + objectName);
            message.setText("Your price alert for " + objectName + " has been set for target price: " + targetPrice);

            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // In production, you might want to throw a custom exception or log this
            // properly
            // For now, we print to stderr so it shows up in the console
        }
    }
}
