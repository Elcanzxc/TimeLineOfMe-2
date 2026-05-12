using TLOM.Domain.Common;
using TLOM.Domain.ValueObjects;

namespace TLOM.Domain.Entities;

/// <summary>
/// Личные данные пользователя. Связан 1:1 с Account.
/// Содержит отображаемый профиль: ник, аватар, био, дата рождения.
/// </summary>
public class UserProfile : AuditableEntity
{
    public Guid AccountId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    /// <summary>
    /// Уникальный отображаемый ник (например, @cinephile_alex).
    /// </summary>
    public string Username { get; set; } = string.Empty;

    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public bool IsProfileCompleted { get; set; } = false;

    public bool IsProfilePrivate { get; set; } = false;

    /// <summary>
    /// Адрес (город/страна/регион) — Value Object, маппится как Owned Entity.
    /// </summary>
    public Address? Address { get; set; }

    // === Navigation Properties ===
    public Account Account { get; set; } = null!;

    public ICollection<Entry> Entries { get; set; } = [];

    public ICollection<Follow> Followers { get; set; } = [];

    public ICollection<Follow> Following { get; set; } = [];

    public ICollection<Like> Likes { get; set; } = [];

    public ICollection<Comment> Comments { get; set; } = [];

    public ICollection<Notification> ReceivedNotifications { get; set; } = [];

    public ICollection<Notification> TriggeredNotifications { get; set; } = [];
}
