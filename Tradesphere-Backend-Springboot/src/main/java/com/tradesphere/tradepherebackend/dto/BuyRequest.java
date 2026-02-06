package com.tradesphere.tradepherebackend.dto;

public class BuyRequest {
    private String symbol;
    private double amount; // Amount in USD (e.g., 1000)
    private String currency;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
