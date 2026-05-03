using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Реакция на запись другого пользователя.
/// Ограничение: уникальная пара (UserId, EntryId). Один лайк на одну запись.
/// </summary>
public class Like : BaseEntity
{
    /// <summary>
    /// Кто лайкнул.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Какую запись лайкнул.
    /// </summary>
    public Guid EntryId { get; set; }

    public DateTime CreatedAt { get; set; }

    // === Navigation Properties ===
    public UserProfile User { get; set; } = null!;

    public Entry Entry { get; set; } = null!;
}
