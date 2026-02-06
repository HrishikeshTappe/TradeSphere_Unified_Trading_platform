package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
}
