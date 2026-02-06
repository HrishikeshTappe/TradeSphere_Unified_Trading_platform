package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.Trade;
import com.tradesphere.tradepherebackend.repository.TradeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TradeService {

    private final TradeRepository tradeRepository;

    public TradeService(TradeRepository tradeRepository) {
        this.tradeRepository = tradeRepository;
    }

    public Trade save(Trade trade) {
        return tradeRepository.save(trade);
    }

    public List<Trade> findAll() {
        return tradeRepository.findAll();
    }
}
