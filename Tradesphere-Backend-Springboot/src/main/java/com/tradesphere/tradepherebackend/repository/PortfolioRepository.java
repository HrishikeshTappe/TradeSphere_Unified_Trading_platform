package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByUserId(Long userId);

    Optional<PortfolioItem> findByUserIdAndAssetSymbol(Long userId, String symbol);
}
