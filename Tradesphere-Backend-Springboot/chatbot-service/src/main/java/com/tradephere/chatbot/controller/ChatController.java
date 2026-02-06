package com.tradephere.chatbot.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class ChatController {

    private final Map<String, String> knowledgeBase = new HashMap<>();

    public ChatController() {
        // Simple Knowledge Base
        knowledgeBase.put("hello", "Hello! I am your TradeSphere Assistant. Ask me about stocks or crypto!");
        knowledgeBase.put("hi", "Hi there! How can I help you today?");
        knowledgeBase.put("btc",
                "Bitcoin (BTC) is the first decentralized cryptocurrency. It is known as digital gold.");
        knowledgeBase.put("bitcoin", "Bitcoin (BTC) is the largest cryptocurrency by market cap.");
        knowledgeBase.put("eth", "Ethereum (ETH) is a decentralized platform that runs smart contracts.");
        knowledgeBase.put("aapl",
                "Apple Inc. (AAPL) designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.");
        knowledgeBase.put("tsla",
                "Tesla, Inc. (TSLA) designs, develops, manufactures, sells and leases electric vehicles and energy generation and storage systems.");
        knowledgeBase.put("doge", "Dogecoin (DOGE) started as a joke but is now a popular meme coin.");
        knowledgeBase.put("help",
                "You can ask me about 'BTC', 'ETH', 'AAPL', or type 'price BTC' to get latest prices.");
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String msg = payload.get("message");
        String response = "I'm not sure about that. Try asking about 'BTC', 'ETH', or 'Stock names'.";

        if (msg != null) {
            String lowerMsg = msg.toLowerCase().trim();

            // Direct match
            if (knowledgeBase.containsKey(lowerMsg)) {
                response = knowledgeBase.get(lowerMsg);
            }
            // Price Query (Mocked for speed/simplicity as requested)
            else if (lowerMsg.contains("price")) {
                response = getMockPriceResponse(lowerMsg);
            }
            // Partial match
            else {
                for (String key : knowledgeBase.keySet()) {
                    if (lowerMsg.contains(key)) {
                        response = knowledgeBase.get(key);
                        break;
                    }
                }
            }
        }

        Map<String, String> res = new HashMap<>();
        res.put("response", response);
        return res;
    }

    private String getMockPriceResponse(String query) {
        Random rand = new Random();
        if (query.contains("btc") || query.contains("bitcoin")) {
            return "Current price of Bitcoin (BTC) is approx $" + (42000 + rand.nextInt(1000));
        } else if (query.contains("eth")) {
            return "Current price of Ethereum (ETH) is approx $" + (2200 + rand.nextInt(100));
        } else if (query.contains("aapl")) {
            return "Apple (AAPL) is trading around $" + (180 + rand.nextInt(5));
        }
        return "Please specify the asset symbol (e.g., 'price BTC').";
    }
}
