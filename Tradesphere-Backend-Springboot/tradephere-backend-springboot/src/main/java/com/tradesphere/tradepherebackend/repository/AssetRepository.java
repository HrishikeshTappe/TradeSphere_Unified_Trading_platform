package com.tradesphere.tradepherebackend.repository;

import com.tradesphere.tradepherebackend.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
}
