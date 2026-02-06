package com.tradesphere.tradepherebackend.controller;

import com.tradesphere.tradepherebackend.model.Asset;
import com.tradesphere.tradepherebackend.service.AssetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetService.save(asset);
    }

    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.findAll();
    }
}
