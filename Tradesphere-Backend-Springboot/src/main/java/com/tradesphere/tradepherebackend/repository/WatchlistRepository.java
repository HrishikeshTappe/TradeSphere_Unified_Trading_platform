package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {
    List<WatchlistEntry> findByUserId(Long userId);

    Optional<WatchlistEntry> findByUserIdAndAssetSymbol(Long userId, String symbol);

    void deleteByUserIdAndAssetSymbol(Long userId, String symbol);
}
