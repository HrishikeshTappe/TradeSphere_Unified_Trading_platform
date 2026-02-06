using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models
{
    [Table("portfolio")]
    public class Portfolio
    {
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("asset_id")]
        public long AssetId { get; set; }

        [Column("quantity")]
        public decimal Quantity { get; set; }

        [Column("avg_buy_price")]
        public decimal AvgBuyPrice { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
