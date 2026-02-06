using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingApp.Data;
using TradingApp.Models;

namespace TradingApp.Controllers
{
    [ApiController]
    [Route("api/watchlist")]
    public class WatchlistController : ControllerBase
    {
        private readonly AppDbContext _db;

        public WatchlistController(AppDbContext db)
        {
            _db = db;
        }

        // ================= ADD =================
        [HttpPost("add")]
        public IActionResult Add(string symbol)
        {
            try
            {
                long userId = 1; // TEMP USER
                if (string.IsNullOrWhiteSpace(symbol))
                    return BadRequest("Symbol required");

                symbol = symbol.ToUpper().Trim();

                var asset = _db.Assets
                    .FirstOrDefault(a => a.Symbol.ToUpper() == symbol);

                if (asset == null)
                    return BadRequest($"Invalid asset symbol: {symbol}");

                // prevent duplicate
                if (_db.Watchlists.Any(w => w.UserId == userId && w.AssetId == asset.Id))
                    return Ok("Already in watchlist");

                var watch = new Watchlist
                {
                    UserId = userId,
                    AssetId = asset.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Watchlists.Add(watch);
                _db.SaveChanges();

                return Ok("Added to watchlist");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ================= LIST =================
        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                long userId = 1;

                var data = _db.Watchlists
                    .Where(w => w.UserId == userId)
                    .Select(w => new
                    {
                        symbol = _db.Assets
                            .Where(a => a.Id == w.AssetId)
                            .Select(a => a.Symbol)
                            .FirstOrDefault()
                    })
                    .ToList();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ================= REMOVE =================
        [HttpDelete("remove")]
        public IActionResult Remove(string symbol)
        {
            try
            {
                long userId = 1;
                if (string.IsNullOrWhiteSpace(symbol))
                    return BadRequest("Symbol required");

                symbol = symbol.ToUpper().Trim();

                var asset = _db.Assets
                    .AsNoTracking()
                    .FirstOrDefault(a => a.Symbol.ToUpper() == symbol);

                if (asset == null)
                    return NotFound($"Asset {symbol} not found");

                var item = _db.Watchlists
                    .FirstOrDefault(w => w.UserId == userId && w.AssetId == asset.Id);

                if (item == null)
                    return NotFound("Not in watchlist");

                _db.Watchlists.Remove(item);
                _db.SaveChanges();

                return Ok(new { message = "Removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

