namespace TradingApp.Models;
public class TradeRequest
{
    public string Symbol { get; set; }
    public decimal Amount { get; set; }   // BUY
    public decimal Qty { get; set; }       // SELL
    public string Currency { get; set; } = "USD";
}
