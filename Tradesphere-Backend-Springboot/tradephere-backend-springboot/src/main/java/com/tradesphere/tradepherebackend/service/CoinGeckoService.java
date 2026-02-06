package com.tradesphere.tradepherebackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class CoinGeckoService {

    private final RestTemplate rest = new RestTemplate();

    public double getPrice(String symbol) {
        String id = switch (symbol) {
            case "BTC" -> "bitcoin";
            case "ETH" -> "ethereum";
            case "XRP" -> "ripple";
            case "SOL" -> "solana";
            case "BNB" -> "binancecoin";
            case "DOGE" -> "dogecoin";
            default -> throw new RuntimeException("Invalid symbol");
        };

        String url =
            "https://api.coingecko.com/api/v3/simple/price?ids="
            + id + "&vs_currencies=usd";

        Map<?,?> res = rest.getForObject(url, Map.class);
        Map<?,?> coin = (Map<?,?>) res.get(id);
        Number price = (Number) coin.get("usd");

        return price.doubleValue();
    }
}
