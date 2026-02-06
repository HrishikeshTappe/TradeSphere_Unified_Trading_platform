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
}
