package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.User;
import com.tradesphere.tradepherebackend.dto.AuthRequest;
import com.tradesphere.tradepherebackend.dto.AuthResponse;
import java.util.List;

public interface UserService {
    User save(User user);

    List<User> findAll();

    User getDemoUser();

    User findByEmail(String email);

    User findById(Long id);

    User updateUser(Long id, User userDetails);

    void deleteUser(Long id);

    // Auth methods
    String register(User user);

    AuthResponse authenticate(AuthRequest request);
}
