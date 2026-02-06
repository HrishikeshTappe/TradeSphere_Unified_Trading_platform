using Microsoft.AspNetCore.Mvc;
using TradingApp.Data;
using TradingApp.Models;

namespace TradingApp.Controllers;

[ApiController]
[Route("api/alert")]


public class AlertController : ControllerBase
{
    private readonly AppDbContext _db;

    public AlertController(AppDbContext db)
    {
        _db = db;
    }

    // MUST match query names: symbol, target, email
    [HttpPost]
    public IActionResult Create(
        [FromQuery] string symbol,
        [FromQuery] decimal target,
        [FromQuery] string email)
    {
        long userId = 1;
        symbol = symbol.ToUpper();

        var asset = _db.Assets.FirstOrDefault(a => a.Symbol == symbol);
        if (asset == null)
            return BadRequest("Invalid symbol");

        var alert = new PriceAlert
        {
            UserId = userId,
            AssetId = asset.Id,
            TargetPrice = target,
            ConditionType = "ABOVE",
            NotifyByEmail = true,
            Email = email,
            IsTriggered = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.PriceAlerts.Add(alert);
        _db.SaveChanges();

        return Ok(new { message = "Alert created successfully" });
    }
}

