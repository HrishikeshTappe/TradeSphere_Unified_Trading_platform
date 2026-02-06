using Microsoft.EntityFrameworkCore;
using TradingApp.Models;

namespace TradingApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Wallet> Wallets => Set<Wallet>();
        public DbSet<Asset> Assets => Set<Asset>();
        public DbSet<Portfolio> Portfolios => Set<Portfolio>();
        public DbSet<Trade> Trades => Set<Trade>();
        public DbSet<Watchlist> Watchlists => Set<Watchlist>();
        public DbSet<PriceAlert> PriceAlerts => Set<PriceAlert>();


    }
}
