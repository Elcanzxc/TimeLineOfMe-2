using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// История изменений статуса — дочерняя сущность Entry.
/// Каждая смена статуса создаёт новую запись.
/// Формирует детальный таймлайн: «Начал → Поставил на паузу → Возобновил → Завершил».
/// </summary>
public class EntryEvent : BaseEntity
{
    public Guid EntryId { get; set; }

    /// <summary>
    /// Новый статус, на который перешла запись.
    /// </summary>
    public EntryStatus Status { get; set; }

    /// <summary>
    /// Когда произошла смена статуса.
    /// </summary>
    public DateTime DateTime { get; set; }

    /// <summary>
    /// Комментарий пользователя к событию (опционально).
    /// </summary>
    public string? Note { get; set; }

    // === Navigation Properties ===
    public Entry Entry { get; set; } = null!;
}
