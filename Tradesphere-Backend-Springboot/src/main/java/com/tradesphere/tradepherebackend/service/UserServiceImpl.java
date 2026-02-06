package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.User;
import com.tradesphere.tradepherebackend.repository.UserRepository;
import com.tradesphere.tradepherebackend.dto.AuthRequest;
import com.tradesphere.tradepherebackend.dto.AuthResponse;
import com.tradesphere.tradepherebackend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.tradesphere.tradepherebackend.repository.WalletRepository walletRepository;

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User getDemoUser() {
        // Return first found user or create a temporary one for demo purposes
        return userRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No users found"));
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = findById(id);
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        // Do not update password here for simplicity, or handle separately
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }

    @Override
    public String register(User user) {
        try {
            // Check if email exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("Email already in use");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setCreatedAt(java.time.LocalDateTime.now());
            User savedUser = userRepository.save(user);

            // Create Wallet
            com.tradesphere.tradepherebackend.model.Wallet wallet = new com.tradesphere.tradepherebackend.model.Wallet();
            wallet.setUser(savedUser);
            wallet.setBalance(1000.00); // Default balance
            wallet.setCurrency("USD");
            walletRepository.save(wallet);

            return "Registration Successful";
        } catch (Exception e) {
            e.printStackTrace(); // PRINT STACK TRACE
            throw e;
        }
    }

    @Override
    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setMessage("Login Successful!");
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());

        return response;
    }
}
