using System.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Auth.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IJwtTokenService jwtService,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .Include(a => a.Role)
            .Include(a => a.UserProfile)
            .FirstOrDefaultAsync(a => a.Email == request.Email, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Email);

        if (account.PasswordHash is null || !_passwordHasher.Verify(request.Password, account.PasswordHash))
            throw new DomainValidationException("Password", "Неверный email или пароль.");

        if (!account.IsActive)
            throw new ForbiddenException("Аккаунт деактивирован.");

        if (!account.EmailConfirmed)
            throw new ForbiddenException("Пожалуйста, подтвердите вашу почту перед входом.");

        var profile = account.UserProfile
            ?? throw new NotFoundException(nameof(UserProfile), account.Id);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new("UserProfileId", profile.Id.ToString()),
            new(ClaimTypes.Email, account.Email),
            new(ClaimTypes.Name, profile.Username),
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
            UserProfileId = profile.Id,
            Username = profile.Username,
            Email = account.Email,
            Role = account.Role.Name.ToString(),
            IsProfileCompleted = profile.IsProfileCompleted
        };
    }
}
