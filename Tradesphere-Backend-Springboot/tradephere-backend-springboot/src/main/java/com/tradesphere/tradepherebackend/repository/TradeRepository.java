package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeRepository extends JpaRepository<Trade, Long> {
}
