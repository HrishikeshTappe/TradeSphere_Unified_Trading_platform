package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.User;
import com.tradesphere.tradepherebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // STRICTLY mapping role from DB to Authority WITHOUT 'ROLE_' prefix
        // Requirement: Authorities must exactly match values stored in DB (ADMIN, USER)
        List<GrantedAuthority> authorities = Collections.EMPTY_LIST;
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole()));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities);
    }
}
