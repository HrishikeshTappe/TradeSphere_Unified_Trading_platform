package com.tradesphere.tradepherebackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class CoinGeckoService {

    private final RestTemplate rest = new RestTemplate();

    public double getPrice(String symbol) {
        // Fallback or single use
        Map<String, Double> prices = getPrices(List.of(symbol));
        return prices.getOrDefault(symbol, 0.0);
    }

    private Map<String, Double> lastSuccessfulPrices = new java.util.HashMap<>();

    public Map<String, Double> getPrices(List<String> symbols) {
        // 1. Map symbols to IDs
        StringBuilder ids = new StringBuilder();
        Map<String, String> idToSymbol = new java.util.HashMap<>();

        for (String val : symbols) {
            String id = getId(val);
            if (ids.length() > 0)
                ids.append(",");
            ids.append(id);
            idToSymbol.put(id, val);
        }

        // 2. Call API
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + ids + "&vs_currencies=usd";

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36");
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>("parameters",
                    headers);

            org.springframework.http.ResponseEntity<Map> response = rest.exchange(url,
                    org.springframework.http.HttpMethod.GET, entity, Map.class);
            Map<?, ?> res = response.getBody();

            if (res == null)
                throw new RuntimeException("Empty response");

            Map<String, Double> result = new java.util.HashMap<>();

            // 3. Parse response (ID -> Price) and map back to (Symbol -> Price)
            for (String id : idToSymbol.keySet()) {
                if (res.containsKey(id)) {
                    Map<?, ?> coinData = (Map<?, ?>) res.get(id);
                    if (coinData != null && coinData.containsKey("usd")) {
                        Number price = (Number) coinData.get("usd");
                        result.put(idToSymbol.get(id), price.doubleValue());
                    }
                }
            }

            // Success! Update cache
            if (!result.isEmpty()) {
                lastSuccessfulPrices.putAll(result);
            }

            return result;
        } catch (Exception e) {
            if (e.getMessage().contains("429")) {
                System.out.println("CoinGecko Rate Limit exceeded (429). Using cached/mock data.");
            } else {
                System.err.println("Error fetching prices: " + e.getMessage());
            }

            // CACHE STRATEGY: Use last known good prices if available
            if (!lastSuccessfulPrices.isEmpty()) {
                System.out.println("Serving cached prices instead of mock data.");
                return new java.util.HashMap<>(lastSuccessfulPrices);
            }

            // Fallback mock data (Only used if we NEVER successfully fetched data)
            Map<String, Double> mock = new java.util.HashMap<>();
            mock.put("BTC", 79890.0); // Real value ~79k
            mock.put("ETH", 2700.0);
            mock.put("XRP", 2.3);
            mock.put("SOL", 140.0);
            mock.put("BNB", 590.0);
            mock.put("DOGE", 0.14);
            mock.put("LTC", 82.0);
            mock.put("TRX", 0.12);
            mock.put("AVAX", 34.0);
            mock.put("LINK", 14.5);
            return mock;
        }
    }

    private String getId(String symbol) {
        return switch (symbol) {
            case "BTC" -> "bitcoin";
            case "ETH" -> "ethereum";
            case "XRP" -> "ripple";
            case "SOL" -> "solana";
            case "BNB" -> "binancecoin";
            case "DOGE" -> "dogecoin";
            case "LTC" -> "litecoin";
            case "TRX" -> "tron";
            case "AVAX" -> "avalanche-2";
            case "LINK" -> "chainlink";
            default -> throw new RuntimeException("Invalid symbol: " + symbol);
        };
    }
}
