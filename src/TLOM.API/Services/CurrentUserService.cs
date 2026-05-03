using System.Security.Claims;
using TLOM.Application.Common.Interfaces;

namespace TLOM.API.Services;

/// <summary>
/// Реализация ICurrentUserService — извлекает данные текущего пользователя из JWT claims в HttpContext.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? AccountId
    {
        get
        {
            var id = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return id is not null ? Guid.Parse(id) : null;
        }
    }

    public Guid? UserProfileId
    {
        get
        {
            var id = User?.FindFirstValue("UserProfileId");
            return id is not null ? Guid.Parse(id) : null;
        }
    }

    public bool IsAdmin => User?.IsInRole("Admin") ?? false;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
