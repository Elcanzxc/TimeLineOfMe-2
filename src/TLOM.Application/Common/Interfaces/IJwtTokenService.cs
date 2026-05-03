using System.Security.Claims;

namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Генерация и валидация JWT-токенов.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Сгенерировать Access Token (короткоживущий, 15 мин).
    /// </summary>
    string GenerateAccessToken(IEnumerable<Claim> claims);

    /// <summary>
    /// Сгенерировать Refresh Token (долгоживущий, 7 дней).
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Извлечь ClaimsPrincipal из истёкшего токена (для refresh flow).
    /// </summary>
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}
