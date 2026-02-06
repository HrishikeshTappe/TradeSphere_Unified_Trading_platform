package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.service.CoinGeckoService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/price")
@CrossOrigin(origins = "http://localhost:5173")
public class PriceController {

    private final CoinGeckoService service;

    public PriceController(CoinGeckoService service) {
        this.service = service;
    }

    @GetMapping("/all")
    public Map<String, Double> all() {
        Map<String, Double> res = new HashMap<>();
        for (String s : List.of("BTC","ETH","XRP","SOL","BNB","DOGE")) {
            res.put(s, service.getPrice(s));
        }
        return res;
    }
}
