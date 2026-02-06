using Microsoft.AspNetCore.Mvc;
using TradingApp.Data;
using TradingApp.Models;
using TradingApp.Services;

namespace TradingApp.Controllers;

[ApiController]
[Route("api/trade")]
public class TradeController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly CryptoPriceService _prices;

    private const decimal USD_TO_INR = 83;

    public TradeController(AppDbContext db, CryptoPriceService prices)
    {
        _db = db;
        _prices = prices;
    }

    private decimal ConvertToUsd(decimal amount, string currency)
    {
        if (!string.IsNullOrEmpty(currency) && currency.ToUpper() == "INR")
            return amount / USD_TO_INR;
        return amount;
    }

    // ---------- BUY ----------
    [HttpPost("buy")]
    public async Task<IActionResult> Buy([FromBody] TradeRequest req)
    {
        long userId = 1;

        var symbol = req.Symbol.ToUpper();
        var amount = ConvertToUsd(req.Amount, req.Currency);

        var asset = _db.Assets.FirstOrDefault(a => a.Symbol == symbol);
        if (asset == null) return BadRequest("Invalid asset");

        var wallet = _db.Wallets.FirstOrDefault(w => w.UserId == userId);
        if (wallet == null || wallet.Balance < amount)
            return BadRequest("Insufficient balance");

        var price = await _prices.GetPrice(symbol);
        var qty = amount / price;

        _db.Trades.Add(new Trade
        {
            UserId = userId,
            AssetId = asset.Id,
            TradeType = "BUY",
            Quantity = qty,
            Price = price,
            TotalAmount = amount,
            TradeTime = DateTime.UtcNow
        });

        var portfolio = _db.Portfolios
            .FirstOrDefault(p => p.UserId == userId && p.AssetId == asset.Id);

        if (portfolio == null)
        {
            _db.Portfolios.Add(new Portfolio
            {
                UserId = userId,
                AssetId = asset.Id,
                Quantity = qty,
                AvgBuyPrice = price,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            var totalQty = portfolio.Quantity + qty;
            portfolio.AvgBuyPrice =
                ((portfolio.Quantity * portfolio.AvgBuyPrice) + amount) / totalQty;

            portfolio.Quantity = totalQty;
            portfolio.UpdatedAt = DateTime.UtcNow;
        }

        wallet.Balance -= amount;
        await _db.SaveChangesAsync();

        return Ok(await Snapshot(userId));
    }

    // ---------- SELL ----------
    [HttpPost("sell")]
    public async Task<IActionResult> Sell([FromBody] TradeRequest req)
    {
        long userId = 1;
        var symbol = req.Symbol.ToUpper();
        var qty = req.Qty;

        var asset = _db.Assets.FirstOrDefault(a => a.Symbol == symbol);
        if (asset == null) return BadRequest("Invalid asset");

        var portfolio = _db.Portfolios
            .FirstOrDefault(p => p.UserId == userId && p.AssetId == asset.Id);

        if (portfolio == null || portfolio.Quantity <= 0)
            return BadRequest("No holdings");

        qty = Math.Min(qty, portfolio.Quantity);

        var price = await _prices.GetPrice(symbol);
        var amount = ConvertToUsd(qty * price, req.Currency);

        _db.Trades.Add(new Trade
        {
            UserId = userId,
            AssetId = asset.Id,
            TradeType = "SELL",
            Quantity = qty,
            Price = price,
            TotalAmount = amount,
            TradeTime = DateTime.UtcNow
        });

        portfolio.Quantity -= qty;
        portfolio.UpdatedAt = DateTime.UtcNow;

        if (portfolio.Quantity <= 0)
            _db.Portfolios.Remove(portfolio);

        var wallet = _db.Wallets.First(w => w.UserId == userId);
        wallet.Balance += amount;

        await _db.SaveChangesAsync();
        return Ok(await Snapshot(userId));
    }

    // ---------- PORTFOLIO ----------
    [HttpGet("portfolio")]
    public async Task<IActionResult> Portfolio()
    {
        return Ok(await Snapshot(1));
    }

    private async Task<object> Snapshot(long userId)
    {
        var wallet = _db.Wallets.FirstOrDefault(w => w.UserId == userId);

        var holdings = _db.Portfolios
            .Where(p => p.UserId == userId)
            .Select(p => new
            {
                symbol = _db.Assets
                    .Where(a => a.Id == p.AssetId)
                    .Select(a => a.Symbol)
                    .FirstOrDefault(),
                quantity = p.Quantity,
                avgBuy = p.AvgBuyPrice
            })
            .ToList();

        return new
        {
            balance = wallet?.Balance ?? 0,
            holdings
        };
    }
}
