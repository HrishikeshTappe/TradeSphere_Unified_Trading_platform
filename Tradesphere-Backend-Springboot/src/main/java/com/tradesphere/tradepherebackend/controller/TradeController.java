package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.dto.BuyRequest;
import com.tradesphere.tradepherebackend.dto.SellRequest;
import com.tradesphere.tradepherebackend.service.CoinGeckoService;
import org.springframework.web.bind.annotation.*;

import com.tradesphere.tradepherebackend.service.*;
import com.tradesphere.tradepherebackend.repository.*;
import com.tradesphere.tradepherebackend.model.*;
import java.util.*;

@RestController
@RequestMapping("/api/trade")
@CrossOrigin(origins = "http://localhost:5173")
public class TradeController {

    private final CoinGeckoService priceService;
    private final StockPriceService stockService;
    private final UserService userService;
    private final WalletService walletService; // Changed from WalletRepository
    private final PortfolioRepository portfolioRepo;
    private final AssetRepository assetRepo;

    public TradeController(
            CoinGeckoService priceService,
            StockPriceService stockService,
            UserService userService,
            WalletService walletService,
            PortfolioRepository portfolioRepo,
            AssetRepository assetRepo) {
        this.priceService = priceService;
        this.stockService = stockService;
        this.userService = userService;
        this.walletService = walletService;
        this.portfolioRepo = portfolioRepo;
        this.assetRepo = assetRepo;
    }

    @GetMapping("/portfolio")
    public Map<String, Object> portfolio(java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("Unauthorized");
        var user = userService.findByEmail(principal.getName());

        var wallet = walletService.getOrCreateWallet(user);
        var items = portfolioRepo.findByUserId(user.getId());

        List<Map<String, Object>> holdings = new ArrayList<>();
        for (var item : items) {
            holdings.add(Map.of(
                    "symbol", item.getAsset().getSymbol(),
                    "quantity", item.getQuantity(),
                    "avgBuy", item.getAvgBuyPrice()));
        }

        return Map.of(
                "balance", wallet.getBalance(),
                "holdings", holdings);
    }

    // Helper to get price dynamically
    private double getAssetPrice(String symbol) {
        if (List.of("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX").contains(symbol)) {
            return stockService.getPrice(symbol);
        }
        return priceService.getPrice(symbol);
    }

    @PostMapping("/buy")
    public Map<String, Object> buy(@RequestBody BuyRequest req, java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("Unauthorized");
        var user = userService.findByEmail(principal.getName());
        var wallet = walletService.getOrCreateWallet(user);

        double price = getAssetPrice(req.getSymbol());
        double amountInUsd = req.getAmount();
        double quantityToBuy = amountInUsd / price;

        if (wallet.getBalance() < amountInUsd) {
            throw new RuntimeException("Insufficient funds");
        }

        // Update Wallet
        wallet.setBalance(wallet.getBalance() - amountInUsd);
        walletService.save(wallet);

        // Update Portfolio
        var asset = assetRepo.findBySymbol(req.getSymbol())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + req.getSymbol()));

        var item = portfolioRepo.findByUserIdAndAssetSymbol(user.getId(), req.getSymbol())
                .orElse(new PortfolioItem());

        if (item.getUser() == null) {
            item.setUser(user);
            item.setAsset(asset);
            item.setQuantity(0);
            item.setAvgBuyPrice(0);
        }

        // Weighted Average calculation
        double totalCost = (item.getQuantity() * item.getAvgBuyPrice()) + amountInUsd;
        double totalQty = item.getQuantity() + quantityToBuy;

        item.setQuantity(totalQty);
        item.setAvgBuyPrice(totalCost / totalQty);
        portfolioRepo.save(item);

        return portfolio(principal);
    }

    @PostMapping("/sell")
    public Map<String, Object> sell(@RequestBody SellRequest req, java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("Unauthorized");
        var user = userService.findByEmail(principal.getName());
        var wallet = walletService.getOrCreateWallet(user);

        double price = getAssetPrice(req.getSymbol());
        double quantityToSell = req.getQty(); // SellRequest uses qty

        var item = portfolioRepo.findByUserIdAndAssetSymbol(user.getId(), req.getSymbol())
                .orElseThrow(() -> new RuntimeException("Holding not found"));

        if (item.getQuantity() < quantityToSell) {
            throw new RuntimeException("Insufficient quantity");
        }

        // Update Wallet
        double proceeds = quantityToSell * price;
        wallet.setBalance(wallet.getBalance() + proceeds);
        walletService.save(wallet);

        // Update Portfolio
        item.setQuantity(item.getQuantity() - quantityToSell);
        if (item.getQuantity() <= 0.000001) {
            portfolioRepo.delete(item);
        } else {
            portfolioRepo.save(item);
        }

        return portfolio(principal);
    }
}
