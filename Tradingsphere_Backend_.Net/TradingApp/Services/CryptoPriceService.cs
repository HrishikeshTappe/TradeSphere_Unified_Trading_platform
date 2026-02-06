using System.Text.Json;

namespace TradingApp.Services;

public class CryptoPriceService
{
    private readonly HttpClient _http;

    private static readonly Dictionary<string, decimal> cache = new();
    private static DateTime lastFetch = DateTime.MinValue;

    private static readonly Dictionary<string, string> map = new()
    {
        ["BTC"] = "bitcoin",
        ["ETH"] = "ethereum",
        ["SOL"] = "solana",
        ["BNB"] = "binancecoin",
        ["XRP"] = "ripple",
        ["DOGE"] = "dogecoin",
        ["LTC"] = "litecoin",
        ["TRX"] = "tron",
        ["AVAX"] = "avalanche-2",
        ["LINK"] = "chainlink"
    };

    public CryptoPriceService(IHttpClientFactory factory)
    {
        _http = factory.CreateClient();
        _http.DefaultRequestHeaders.Add("User-Agent", "TradingApp/1.0");
        _http.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    // 🔥 Fetch all prices at once
    public async Task<Dictionary<string, decimal>> GetAllPrices()
    {
        if (DateTime.UtcNow - lastFetch < TimeSpan.FromMinutes(2) && cache.Count > 0)
            return cache;

        var ids = string.Join(",", map.Values);

        var url =
            $"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd";

        var res = await _http.GetAsync(url);
        if (!res.IsSuccessStatusCode)
            return cache;

        var json = await res.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        foreach (var pair in map)
        {
            if (doc.RootElement.TryGetProperty(pair.Value, out var coin))
            {
                cache[pair.Key] = coin.GetProperty("usd").GetDecimal();
            }
        }

        lastFetch = DateTime.UtcNow;
        return cache;
    }

    public async Task<decimal> GetPrice(string symbol)
    {
        var prices = await GetAllPrices();
        return prices.ContainsKey(symbol) ? prices[symbol] : 0;
    }
}
