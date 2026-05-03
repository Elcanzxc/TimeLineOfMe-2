using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Запись аудита действий пользователей — для админ-панели.
/// Фиксирует: кто, когда, какую сущность создал/изменил/удалил.
/// Хранит JSON-снимки до и после изменения.
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>
    /// Кто совершил действие.
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Тип действия: Created, Updated, Deleted.
    /// </summary>
    public AuditAction Action { get; set; }

    /// <summary>
    /// Тип сущности: Entry, MediaItem и т.д.
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// ID затронутой сущности.
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// JSON-снимок до изменения.
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// JSON-снимок после изменения.
    /// </summary>
    public string? NewValues { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime Timestamp { get; set; }

    // === Navigation Properties ===
    public Account Account { get; set; } = null!;
}
