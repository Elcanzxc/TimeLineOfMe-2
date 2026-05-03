using System.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Auth.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtService;
    private readonly IGoogleAuthService _googleAuth;
    private readonly INotificationService _notificationService;

    public GoogleLoginCommandHandler(
        IApplicationDbContext context,
        IJwtTokenService jwtService,
        IGoogleAuthService googleAuth,
        INotificationService notificationService)
    {
        _context = context;
        _jwtService = jwtService;
        _googleAuth = googleAuth;
        _notificationService = notificationService;
    }

    public async Task<AuthResponse> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var googleUser = await _googleAuth.ValidateTokenAsync(request.IdToken, cancellationToken)
            ?? throw new DomainValidationException("IdToken", "Невалидный Google токен.");

        // Ищем существующий аккаунт по GoogleId или Email
        var account = await _context.Accounts
            .Include(a => a.Role)
            .Include(a => a.UserProfile)
            .FirstOrDefaultAsync(a => a.GoogleId == googleUser.GoogleId || a.Email == googleUser.Email, cancellationToken);

        bool isNewUser = account is null;

        if (isNewUser)
        {
            // Генерируем уникальный username из email
            var baseUsername = googleUser.Email.Split('@')[0].Replace(".", "_");
            var username = baseUsername;
            var counter = 1;
            while (await _context.UserProfiles.AnyAsync(p => p.Username == username, cancellationToken))
            {
                username = $"{baseUsername}_{counter++}";
            }

            var userRole = await _context.Roles.FirstAsync(r => r.Name == RoleName.User, cancellationToken);

            account = new Account
            {
                Id = Guid.NewGuid(),
                Email = googleUser.Email,
                GoogleId = googleUser.GoogleId,
                EmailConfirmed = true,
                RoleId = userRole.Id,
                IsActive = true,
                DateCreated = DateTime.UtcNow
            };

            var profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                Username = username,
                FirstName = googleUser.FirstName,
                LastName = googleUser.LastName,
                AvatarUrl = googleUser.AvatarUrl
            };

            _context.Accounts.Add(account);
            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync(cancellationToken);

            // Системное уведомление для нового пользователя
            await _notificationService.SendAsync(
                profile.Id,
                NotificationType.System,
                "Добро пожаловать в Time Line Of Me! 🎉 Заполните свой профиль.",
                cancellationToken: cancellationToken);

            // Уведомление админам
            await _notificationService.SendToAdminsAsync(
                $"Новый пользователь зарегистрирован: @{username}",
                actorId: profile.Id,
                entityType: nameof(UserProfile),
                entityId: profile.Id,
                cancellationToken: cancellationToken);

            // Reload navigations
            account = await _context.Accounts
                .Include(a => a.Role)
                .Include(a => a.UserProfile)
                .FirstAsync(a => a.Id == account.Id, cancellationToken);
        }
        else
        {
            if (!account!.IsActive)
                throw new ForbiddenException("Аккаунт деактивирован.");

            // Привязываем Google, если ранее не было
            account.GoogleId ??= googleUser.GoogleId;
            account.EmailConfirmed = true;
        }

        var userProfile = account.UserProfile!;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new("UserProfileId", userProfile.Id.ToString()),
            new(ClaimTypes.Email, account.Email),
            new(ClaimTypes.Name, userProfile.Username),
            new(ClaimTypes.Role, account.Role.Name.ToString())
        };

        var accessToken = _jwtService.GenerateAccessToken(claims);
        var refreshToken = _jwtService.GenerateRefreshToken();

        account.RefreshToken = refreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        account.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            AccountId = account.Id,
            UserProfileId = userProfile.Id,
            Username = userProfile.Username,
            Email = account.Email,
            Role = account.Role.Name.ToString(),
            IsProfileCompleted = userProfile.IsProfileCompleted
        };
    }
}
