package com.tradesphere.tradepherebackend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WatchlistController {

    private final com.tradesphere.tradepherebackend.service.UserService userService;
    private final com.tradesphere.tradepherebackend.repository.WatchlistRepository watchlistRepo;
    private final com.tradesphere.tradepherebackend.repository.AssetRepository assetRepo;

    public WatchlistController(
            com.tradesphere.tradepherebackend.service.UserService userService,
            com.tradesphere.tradepherebackend.repository.WatchlistRepository watchlistRepo,
            com.tradesphere.tradepherebackend.repository.AssetRepository assetRepo) {
        this.userService = userService;
        this.watchlistRepo = watchlistRepo;
        this.assetRepo = assetRepo;
    }

    @GetMapping
    public List<Map<String, String>> getWatchlist() {
        var user = userService.getDemoUser();
        var items = watchlistRepo.findByUserId(user.getId());

        List<Map<String, String>> res = new ArrayList<>();
        for (var item : items) {
            res.add(Map.of("symbol", item.getAsset().getSymbol()));
        }
        return res;
    }

    @PostMapping("/add")
    public List<Map<String, String>> addToWatchlist(@RequestParam String symbol) {
        var user = userService.getDemoUser();
        var asset = assetRepo.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not found")); // Or create? Ideally fallback.

        // Prevent duplicates
        if (watchlistRepo.findByUserIdAndAssetSymbol(user.getId(), symbol).isEmpty()) {
            var entry = new com.tradesphere.tradepherebackend.model.WatchlistEntry();
            entry.setUser(user);
            entry.setAsset(asset);
            watchlistRepo.save(entry);
        }

        return getWatchlist();
    }

    @DeleteMapping("/remove")
    @jakarta.transaction.Transactional
    public List<Map<String, String>> removeFromWatchlist(@RequestParam String symbol) {
        var user = userService.getDemoUser();
        watchlistRepo.deleteByUserIdAndAssetSymbol(user.getId(), symbol);
        return getWatchlist();
    }
}
