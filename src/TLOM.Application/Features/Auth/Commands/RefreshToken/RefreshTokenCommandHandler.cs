using System.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Auth.Responses;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, IJwtTokenService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken))
            throw new ForbiddenException("AccessToken is required for refresh.");

        var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
        var accountIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new ForbiddenException("Невалидный токен.");

        var accountId = Guid.Parse(accountIdClaim);

        var account = await _context.Accounts
            .Include(a => a.Role)
            .Include(a => a.UserProfile)
            .FirstOrDefaultAsync(a => a.Id == accountId, cancellationToken)
            ?? throw new ForbiddenException("Аккаунт не найден.");

        if (account.RefreshToken != request.RefreshToken ||
            account.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new ForbiddenException("Refresh token невалиден или истёк.");
        }

        var profile = account.UserProfile!;

        var newClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new("UserProfileId", profile.Id.ToString()),
            new(ClaimTypes.Email, account.Email),
            new(ClaimTypes.Name, profile.Username),
            new(ClaimTypes.Role, account.Role.Name.ToString())
        };

        var newAccessToken = _jwtService.GenerateAccessToken(newClaims);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        account.RefreshToken = newRefreshToken;
        account.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
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
