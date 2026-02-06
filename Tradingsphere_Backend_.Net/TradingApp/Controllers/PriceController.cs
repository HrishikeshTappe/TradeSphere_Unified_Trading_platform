using Microsoft.AspNetCore.Mvc;
using TradingApp.Services;

namespace TradingApp.Controllers;

[ApiController]
[Route("api/price")]
public class PriceController : ControllerBase
{
    private readonly CryptoPriceService _crypto;

    public PriceController(CryptoPriceService crypto)
    {
        _crypto = crypto;
    }

    // GET /api/price?symbol=BTC
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? symbol)
    {
        // ✅ Prevent 400 Bad Request
        if (string.IsNullOrWhiteSpace(symbol))
            return Ok(0);

        var price = await _crypto.GetPrice(symbol.ToUpper());
        return Ok(price);
    }

    // GET /api/price/all
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var prices = await _crypto.GetAllPrices();
        return Ok(prices);
    }
}
