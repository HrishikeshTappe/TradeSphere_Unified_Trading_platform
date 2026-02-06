package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    java.util.Optional<User> findByEmail(String email);
}
