namespace TLOM.Application.Features.Auth.Responses;

/// <summary>
/// Результат аутентификации — пара токенов.
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAt { get; set; }

    public Guid AccountId { get; set; }

    public Guid UserProfileId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool IsProfileCompleted { get; set; }
}
