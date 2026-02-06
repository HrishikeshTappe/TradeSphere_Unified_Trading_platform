package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.dto.ContactRequest;
import com.tradesphere.tradepherebackend.model.Contact;

import java.util.List;

public interface ContactService {
    String submitContact(ContactRequest request);
    List<Contact> getAllContacts();
    Contact getContactById(Long id);
    void deleteContact(Long id);
}
