using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Сущность для хранения Refresh токенов. 
/// Связь 1 ко многим с Account позволяет поддерживать множественные сессии.
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid AccountId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiryTime { get; set; }

    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; }

    // === Navigation Properties ===
    public Account Account { get; set; } = null!;
}
