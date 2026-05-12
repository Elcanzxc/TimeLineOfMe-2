using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Комментарий к записи другого пользователя.
/// </summary>
public class Comment : AuditableEntity, ISoftDeletable
{
    /// <summary>
    /// Кто написал комментарий.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// К какой записи.
    /// </summary>
    public Guid EntryId { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    // === Navigation Properties ===
    public UserProfile User { get; set; } = null!;

    public Entry Entry { get; set; } = null!;
}
