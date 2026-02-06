package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.Wallet;
import com.tradesphere.tradepherebackend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    public Wallet save(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    public List<Wallet> findAll() {
        return walletRepository.findAll();
    }

    public Wallet getOrCreateWallet(com.tradesphere.tradepherebackend.model.User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setUser(user);
                    newWallet.setBalance(1000.00); // Default balance
                    newWallet.setCurrency("USD");
                    return walletRepository.save(newWallet);
                });
    }
}
