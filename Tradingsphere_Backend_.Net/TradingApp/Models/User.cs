namespace TradingApp.Models
{
    public class User
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
}
