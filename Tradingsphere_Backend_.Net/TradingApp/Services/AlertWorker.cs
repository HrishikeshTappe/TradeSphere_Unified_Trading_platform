using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using TradingApp.Data;

namespace TradingApp.Services
{
    public class AlertWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly EmailService _email;

        public AlertWorker(IServiceScopeFactory scopeFactory, EmailService email)
        {
            _scopeFactory = scopeFactory;
            _email = email;
        }

        protected override async Task ExecuteAsync(CancellationToken stop)
        {
            while (!stop.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var alerts = db.PriceAlerts
                    .Where(a => !a.IsTriggered && a.NotifyByEmail)
                    .ToList();

                foreach (var alert in alerts)
                {
                    decimal livePrice = GetLivePrice(alert.AssetId);

                    bool hit =
                        alert.ConditionType == "ABOVE"
                            ? livePrice >= alert.TargetPrice
                            : livePrice <= alert.TargetPrice;

                    if (hit)
                    {
                        // get symbol name
                        var symbol = db.Assets
                            .Where(a => a.Id == alert.AssetId)
                            .Select(a => a.Symbol)
                            .FirstOrDefault();

                        _email.Send(
                            alert.Email!,
                            symbol ?? "Asset",
                            livePrice,
                            alert.ConditionType
                        );

                        alert.IsTriggered = true;
                    }
                }

                db.SaveChanges();
                await Task.Delay(30000, stop); // every 30 seconds
            }
        }

        // TEMP MOCK — replace later with real API
        private decimal GetLivePrice(long assetId)
        {
            return new Random().Next(100, 100000);
        }
    }
}
