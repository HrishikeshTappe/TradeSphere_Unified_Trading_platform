package com.tradesphere.tradepherebackend.dto;

public class SellRequest {
    private String symbol;
    private double qty;
    private String currency;

    public String getSymbol() { return symbol; }
    public double getQty() { return qty; }
    public String getCurrency() { return currency; }
}
