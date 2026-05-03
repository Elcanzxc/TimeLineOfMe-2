using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Сущность аутентификации — отдельно от профиля.
/// Хранит учётные данные, OAuth-привязку, JWT refresh-токен.
/// </summary>
public class Account : BaseEntity
{
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Nullable — при OAuth (Google) пароль может отсутствовать.
    /// </summary>
    public string? PasswordHash { get; set; }

    public bool EmailConfirmed { get; set; }
    
    public string? EmailConfirmationToken { get; set; }
    
    public string? PasswordResetToken { get; set; }
    
    public DateTime? PasswordResetTokenExpiry { get; set; }

    /// <summary>
    /// Идентификатор Google-аккаунта для OAuth 2.0 привязки.
    /// </summary>
    public string? GoogleId { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public Guid RoleId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime DateCreated { get; set; }

    public DateTime? LastLoginAt { get; set; }

    // === Navigation Properties ===
    public Role Role { get; set; } = null!;

    public UserProfile? UserProfile { get; set; }

    public ICollection<AuditLog> AuditLogs { get; set; } = [];
}
