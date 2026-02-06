package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.model.Wallet;
import com.tradesphere.tradepherebackend.service.WalletService;
import com.tradesphere.tradepherebackend.service.UserService;
import com.tradesphere.tradepherebackend.repository.WalletRepository;
import com.tradesphere.tradepherebackend.dto.WalletBalanceRequest; // Added import
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;
    private final WalletRepository walletRepository;

    public WalletController(WalletService walletService, UserService userService, WalletRepository walletRepository) {
        this.walletService = walletService;
        this.userService = userService;
        this.walletRepository = walletRepository;
    }

    @PostMapping
    public Wallet createWallet(@RequestBody Wallet wallet) {
        return walletService.save(wallet);
    }

    @PostMapping("/add")
    public Wallet addBalance(@RequestBody WalletBalanceRequest request, java.security.Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        String email = principal.getName();
        var user = userService.findByEmail(email);

        var wallet = walletService.getOrCreateWallet(user);

        Double amount = request.getAmount();
        if (amount == null || amount <= 0) {
            throw new RuntimeException("Invalid amount");
        }

        wallet.setBalance(wallet.getBalance() + amount);
        return walletRepository.save(wallet);
    }

    @GetMapping
    public List<Wallet> getAllWallets() {
        return walletService.findAll();
    }
}
