package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
