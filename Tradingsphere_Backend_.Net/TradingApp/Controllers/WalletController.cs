using Microsoft.AspNetCore.Mvc;
using TradingApp.Data;
using TradingApp.Models;

namespace TradingApp.Controllers;

[ApiController]
[Route("api/wallet")]
public class WalletController : ControllerBase
{
    private readonly AppDbContext _db;

    public WalletController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddMoney(decimal amount)
    {
        if (amount <= 0)
            return BadRequest("Invalid amount");

        long userId = 1;

        var wallet = _db.Wallets.FirstOrDefault(w => w.UserId == userId);

        if (wallet == null)
        {
            wallet = new Wallet
            {
                UserId = userId,
                Balance = amount,
                Currency = "USD",
                UpdatedAt = DateTime.UtcNow
            };
            _db.Wallets.Add(wallet);
        }
        else
        {
            wallet.Balance += amount;
            wallet.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { wallet.Balance });
    }

    [HttpGet]
    public IActionResult GetWallet()
    {
        var wallet = _db.Wallets.FirstOrDefault(w => w.UserId == 1);
        return Ok(new { balance = wallet?.Balance ?? 0 });
    }
}
