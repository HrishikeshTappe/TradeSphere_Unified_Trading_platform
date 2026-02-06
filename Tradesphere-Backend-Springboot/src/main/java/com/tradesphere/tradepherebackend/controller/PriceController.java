package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.service.CoinGeckoService;
import com.tradesphere.tradepherebackend.service.StockPriceService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/price")
@CrossOrigin(origins = "http://localhost:5173")
public class PriceController {

    private final CoinGeckoService service;
    private final StockPriceService stockService;

    public PriceController(CoinGeckoService service, StockPriceService stockService) {
        this.service = service;
        this.stockService = stockService;
    }

    @GetMapping("/all")
    public Map<String, Double> all() {
        // Define the list of assets we want to track
        List<String> assets = List.of("BTC", "ETH", "XRP", "SOL", "BNB", "DOGE", "LTC", "TRX", "AVAX", "LINK");
        return service.getPrices(assets);
    }

    @GetMapping("/stocks")
    public Map<String, Double> stocks() {
        List<String> stocks = List.of("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX");
        Map<String, Double> prices = new HashMap<>();
        for (String s : stocks) {
            prices.put(s, stockService.getPrice(s));
        }
        return prices;
    }

    @GetMapping
    public Double getPrice(@RequestParam String symbol) {
        // Simple heuristic: if it's a known stock, use stock service
        if (List.of("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX").contains(symbol)) {
            return stockService.getPrice(symbol);
        }
        return service.getPrice(symbol);
    }
}
