package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.model.Wallet;
import com.tradesphere.tradepherebackend.service.WalletService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    public Wallet createWallet(@RequestBody Wallet wallet) {
        return walletService.save(wallet);
    }

    @GetMapping
    public List<Wallet> getAllWallets() {
        return walletService.findAll();
    }
}
