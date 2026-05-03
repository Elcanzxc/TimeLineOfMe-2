using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Подписка на пользователя.
/// Ограничение: уникальная пара (FollowerId, FollowingId). Нельзя подписаться на себя.
/// </summary>
public class Follow : BaseEntity
{
    /// <summary>
    /// Кто подписался.
    /// </summary>
    public Guid FollowerId { get; set; }

    /// <summary>
    /// На кого подписался.
    /// </summary>
    public Guid FollowingId { get; set; }

    public DateTime CreatedAt { get; set; }

    // === Navigation Properties ===
    public UserProfile Follower { get; set; } = null!;

    public UserProfile Following { get; set; } = null!;
}
