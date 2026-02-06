package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySymbol(String symbol);
}
