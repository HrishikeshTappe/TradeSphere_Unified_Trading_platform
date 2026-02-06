using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models
{
    [Table("wallet")]
    public class Wallet
    {
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("balance")]
        public decimal Balance { get; set; }

        [Column("currency")]
        public string Currency { get; set; } = "USD";

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
