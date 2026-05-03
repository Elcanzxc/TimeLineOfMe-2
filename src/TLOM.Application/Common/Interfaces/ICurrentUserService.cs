namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Текущий авторизованный пользователь — извлекается из JWT-токена в HttpContext.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// ID аккаунта текущего пользователя. Null если не аутентифицирован.
    /// </summary>
    Guid? AccountId { get; }

    /// <summary>
    /// ID профиля текущего пользователя. Null если не аутентифицирован.
    /// </summary>
    Guid? UserProfileId { get; }

    /// <summary>
    /// Является ли текущий пользователь администратором.
    /// </summary>
    bool IsAdmin { get; }

    /// <summary>
    /// Аутентифицирован ли пользователь.
    /// </summary>
    bool IsAuthenticated { get; }
}
