using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Карточка — сердце таймлайна. Связывает Пользователя и Контент.
/// Хранит статус, оценку, ревью, время и флаги приватности/избранного.
/// </summary>
public class Entry : AuditableEntity
{
    public Guid UserId { get; set; }

    public Guid MediaItemId { get; set; }

    /// <summary>
    /// Текущее состояние: Planned, InProgress, Completed, Dropped, OnHold.
    /// Всегда отражает последний актуальный статус.
    /// </summary>
    public EntryStatus Status { get; set; }

    /// <summary>
    /// Личная оценка пользователя от 0 до 10.
    /// </summary>
    public int? Rating { get; set; }

    /// <summary>
    /// Текстовое описание/мнение (Markdown support).
    /// </summary>
    public string? Review { get; set; }

    /// <summary>
    /// Потраченное время в минутах.
    /// </summary>
    public int? TimeSpent { get; set; }

    /// <summary>
    /// Скрыть запись из публичного таймлайна.
    /// </summary>
    public bool IsPrivate { get; set; }

    /// <summary>
    /// Является ли карточка избранной.
    /// </summary>
    public bool IsFavorite { get; set; }

    // === Navigation Properties ===
    public UserProfile User { get; set; } = null!;

    public MediaItem MediaItem { get; set; } = null!;

    /// <summary>
    /// Хронология смен статусов — формирует детальный таймлайн.
    /// </summary>
    public ICollection<EntryEvent> Events { get; set; } = [];

    public ICollection<Like> Likes { get; set; } = [];

    public ICollection<Comment> Comments { get; set; } = [];
}
