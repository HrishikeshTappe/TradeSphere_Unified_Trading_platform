package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.dto.ContactRequest;
import com.tradesphere.tradepherebackend.model.Contact;
import com.tradesphere.tradepherebackend.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContactController {

    private final ContactService contactService;

    // PUBLIC - Submit contact form
    @PostMapping
    public ResponseEntity<String> submitContact(
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.submitContact(request));
    }

    // ADMIN - Get all contacts
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    // ADMIN - Get contact by id
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Contact> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    // ADMIN - Delete contact
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok("Contact deleted successfully");
    }
}
