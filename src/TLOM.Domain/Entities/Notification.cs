using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Уведомление пользователю или админу.
/// Сохраняется в БД (персистентное) + отправляется через SignalR (real-time push).
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>
    /// Кому адресовано уведомление.
    /// </summary>
    public Guid RecipientId { get; set; }

    /// <summary>
    /// Кто вызвал действие (nullable для системных уведомлений).
    /// </summary>
    public Guid? ActorId { get; set; }

    /// <summary>
    /// Тип: NewFollower, EntryLiked, NewComment, AdminAlert, System.
    /// </summary>
    public NotificationType Type { get; set; }

    /// <summary>
    /// Тип затронутой сущности ("Entry", "Comment", "Follow" и т.д.).
    /// </summary>
    public string? EntityType { get; set; }

    /// <summary>
    /// ID затронутой сущности (для перехода по клику).
    /// </summary>
    public Guid? EntityId { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    // === Navigation Properties ===
    public UserProfile Recipient { get; set; } = null!;

    public UserProfile? Actor { get; set; }
}
