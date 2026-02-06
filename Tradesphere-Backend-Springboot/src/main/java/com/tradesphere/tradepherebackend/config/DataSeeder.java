package com.tradesphere.tradepherebackend.config;

import com.tradesphere.tradepherebackend.model.Asset;
import com.tradesphere.tradepherebackend.repository.AssetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AssetRepository assetRepo;

    public DataSeeder(AssetRepository assetRepo) {
        this.assetRepo = assetRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        seedStocks();
    }

    private void seedStocks() {
        List<String> symbols = List.of("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX");

        for (String sym : symbols) {
            if (assetRepo.findBySymbol(sym).isEmpty()) {
                Asset a = new Asset();
                a.setSymbol(sym);
                a.setName(getName(sym));
                a.setAssetType("STOCK");
                a.setExchange("NASDAQ");
                assetRepo.save(a);
                System.out.println("Seeded stock: " + sym);
            }
        }
    }

    private String getName(String sym) {
        return switch (sym) {
            case "AAPL" -> "Apple Inc.";
            case "MSFT" -> "Microsoft Corp.";
            case "GOOGL" -> "Alphabet Inc.";
            case "AMZN" -> "Amazon.com";
            case "TSLA" -> "Tesla Inc.";
            case "NVDA" -> "NVIDIA Corp.";
            case "META" -> "Meta Platforms";
            case "NFLX" -> "Netflix Inc.";
            default -> sym;
        };
    }
}
