using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradingApp.Models;

[Table("price_alert")]
public class PriceAlert
{
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("asset_id")]
    public long AssetId { get; set; }

    [Column("target_price")]
    public decimal TargetPrice { get; set; }

    [Column("condition_type")]
    public string ConditionType { get; set; } = "ABOVE";

    [Column("is_triggered")]
    public bool IsTriggered { get; set; }

    [Column("notify_by_email")]
    public bool NotifyByEmail { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
