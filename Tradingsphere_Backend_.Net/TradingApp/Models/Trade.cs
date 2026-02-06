using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models
{
    [Table("trade")]
    public class Trade
    {
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("asset_id")]
        public long AssetId { get; set; }

        [Column("trade_type")]
        public string TradeType { get; set; } = string.Empty;

        [Column("quantity")]
        public decimal Quantity { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("trade_time")]
        public DateTime TradeTime { get; set; }
    }
}
