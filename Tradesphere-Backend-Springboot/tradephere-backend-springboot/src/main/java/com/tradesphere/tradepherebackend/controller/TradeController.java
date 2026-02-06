package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.dto.BuyRequest;
import com.tradesphere.tradepherebackend.dto.SellRequest;
import com.tradesphere.tradepherebackend.service.CoinGeckoService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trade")
@CrossOrigin(origins = "http://localhost:5173")
public class TradeController {

    private double balance = 10000;
    private final Map<String, Double> holdings = new HashMap<>();
    private final Map<String, Double> avgBuy = new HashMap<>();

    private final CoinGeckoService priceService;

    public TradeController(CoinGeckoService priceService) {
        this.priceService = priceService;
    }

    @GetMapping("/portfolio")
    public Map<String, Object> portfolio() {
        List<Map<String, Object>> list = new ArrayList<>();

        for (String s : holdings.keySet()) {
            Map<String, Object> h = new HashMap<>();
            h.put("symbol", s);
            h.put("quantity", holdings.get(s));
            h.put("avgBuy", avgBuy.get(s));
            list.add(h);
        }

        return Map.of(
            "balance", balance,
            "holdings", list
        );
    }

    @PostMapping("/buy")
    public Map<String, Object> buy(@RequestBody BuyRequest req) {
        double price = priceService.getPrice(req.getSymbol());
        double cost = price * req.getQty();

        balance -= cost;
        holdings.merge(req.getSymbol(), req.getQty(), Double::sum);
        avgBuy.put(req.getSymbol(), price);

        return portfolio();
    }

    @PostMapping("/sell")
    public Map<String, Object> sell(@RequestBody SellRequest req) {
        double price = priceService.getPrice(req.getSymbol());
        double proceeds = price * req.getQty();

        balance += proceeds;
        holdings.put(
            req.getSymbol(),
            holdings.get(req.getSymbol()) - req.getQty()
        );

        return portfolio();
    }
}
