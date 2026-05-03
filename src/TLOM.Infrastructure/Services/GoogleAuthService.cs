using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Infrastructure.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GoogleUserInfo?> ValidateTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_configuration["Google:ClientId"]
                    ?? throw new InvalidOperationException("Google ClientId не настроен.")]
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new GoogleUserInfo
            {
                GoogleId = payload.Subject,
                Email = payload.Email,
                FirstName = payload.GivenName,
                LastName = payload.FamilyName,
                AvatarUrl = payload.Picture
            };
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Невалидный Google токен");
            return null;
        }
    }
}
