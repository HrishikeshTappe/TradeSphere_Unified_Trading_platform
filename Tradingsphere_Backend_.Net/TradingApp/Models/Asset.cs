using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models
{
    [Table("asset")]
    public class Asset
    {
        public long Id { get; set; }

        [Column("symbol")]
        public string Symbol { get; set; } = string.Empty;

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("asset_type")]
        public string AssetType { get; set; } = string.Empty;

        [Column("exchange")]
        public string Exchange { get; set; } = string.Empty;
    }
}
