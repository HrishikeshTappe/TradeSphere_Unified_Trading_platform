using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models
{
    [Table("watchlist")]
    public class Watchlist
    {
        [Column("id")]
        public long Id { get; set; }

        [Column("user_id")]   
        public long UserId { get; set; }

        [Column("asset_id")]  
        public long AssetId { get; set; }

        [Column("created_at")] 
        public DateTime CreatedAt { get; set; }
    }
}
