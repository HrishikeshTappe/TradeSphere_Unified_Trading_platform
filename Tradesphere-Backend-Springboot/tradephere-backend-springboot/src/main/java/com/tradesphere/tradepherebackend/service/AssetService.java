package com.tradesphere.tradepherebackend.service;

import com.tradesphere.tradepherebackend.model.Asset;
import com.tradesphere.tradepherebackend.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public Asset save(Asset asset) {
        return assetRepository.save(asset);
    }

    public List<Asset> findAll() {
        return assetRepository.findAll();
    }
}
