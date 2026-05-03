namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Валидация Google OAuth токена — реализуется в Infrastructure.
/// </summary>
public interface IGoogleAuthService
{
    Task<GoogleUserInfo?> ValidateTokenAsync(string idToken, CancellationToken cancellationToken = default);
}

public class GoogleUserInfo
{
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? AvatarUrl { get; set; }
}
